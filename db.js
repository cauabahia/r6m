/* =====================================================================
   R6 ESPORTS MANAGER — BANCO DE DADOS (edite à vontade)
   Este arquivo precisa ficar na MESMA PASTA do index.html.
   Só vale para CARREIRAS NOVAS: saves já iniciados guardam o próprio elenco.

   LIGAS  → {id, tag, name, region, color}
            Ligas de 8 ou 10 times funcionam (a tabela de pontos cobre até 10 posições).

   TIMES  → cada linha é:
            [id, nome, sigla curta, liga, PODER, 'titulares|reserva', opções]
     id       único, sem espaços (ex.: 'faze')
     liga     id de uma das LIGAS acima
     PODER    força do time (~70–96); define o rating dos jogadores
     elenco   5 titulares separados por vírgula; depois do "|" vêm os reservas (opcional)
              ex.: 'Fultz,njr,J9O,Kyno,Nuers|Koshi'
              Marcas opcionais em cada titular:
                Nick*          → é o IGL do time (só quem tiver * aparece como IGL)
                Nick:Entry     → posição: Entry, Flex, Sup1, Sup2 ou IGL (as 5 posições reais do R6)
                Nick:IGL       → o mesmo que Nick*
              Sem posição, o jogo escolhe pelo perfil (Aim alto → Entry, Gamesense alto → Sup). O IGL nunca é adivinhado.
              Um time normal tem uma de cada: Entry, Flex, Sup1, Sup2 e IGL. Time sem IGL definido repete uma posição.
              ex.: 'Cyber:Entry,KDS:Flex,Handyy:Sup1,Soulz1:Sup2,Vitaking*'

              RATING de cada jogador (vale para titulares E reservas):
                Nick=95                   → OVR 95 exato (Aim e Gamesense se ajustam)
                Nick=95{clu:99;led:70}    → OVR 95 e atributos específicos
                Nick{aim:97;gs:93}        → Aim/Gamesense definidos (o OVR sai deles)
                Nick:Entry=95{age:22;pot:99;open:98}   → tudo junto
              Dentro das chaves separe com ; (ponto e vírgula). Chaves aceitas:
                aim, gs, clu (clutch), led (liderança), tw (equipe), roam (roaming), open (abertura),
                util (utilidade), men (mental), info (informação), cons (consistência), adp (adaptação),
                age (idade), pot (potencial) e loy (lealdade ao clube, 0–100). Valores de 45 a 99 (loy de 0 a 100).
              ESTE ARQUIVO JÁ VEM PREENCHIDO com o rating e a função que o jogo usava (Nick:Função=OVR). Basta trocar os números.
              POSIÇÕES: Entry, Flex e Support (Sup1/Sup2) vêm do campo "role" de cada jogador na Liquipedia (set/2026); IGL (*) é o 1º jogador do time
              marcado como IGL lá; sem isso, o capitão do time na Liquipedia; sem isso, ESTIMADO pelo maior atributo de liderança (fora os Entry). Todo time tem um IGL.
              Onde a Liquipedia não tem a posição do jogador, o jogo escolheu pelo perfil de Aim/Gamesense. Sup1 e Sup2 seguem a ordem do elenco.
              Sem rating, o jogo gera: PODER do time ± uma variação por jogador (a estrela fica no topo).
              Se você definir o rating de QUALQUER titular do time, o PODER do time passa a ser a média dos ratings.
              ex.: 'Cyber:Entry=97,KDS:Flex=95{clu:99},Handyy:Sup1=93,Soulz1:Sup2=92,Vitaking*=90|Reserva=80'
     opções   tag:'ABC'   sigla no escudo (até 3–4 letras)
              color:'#hex' cor do time
              src:1        marca o poder como "informado por você" (sem isso aparece "~ estimativa")
              ewc:1        campeão da EWC (ganha +400 SI Points e o troféu 🏆 na 1ª temporada)
              star:'Nick'  jogador-estrela (rating mais alto do time; mais caro no mercado)
              coach:'…', note:'…', ex:'…'   textos informativos
              rivals:['id','id']   rivais diretos do time (vale nos dois sentidos). Jogadores NÃO aceitam ir de um rival para o outro
                           (só com oferta bem acima do valor e pouca lealdade). Além destes pares, os 4 maiores poderes de cada liga
                           são rivais entre si automaticamente. Ex.: rivals:['furia','liquid']
   ===================================================================== */
const LEAGUES = [
  {id:'SAL',  tag:'SAL',   name:'South America League',     region:'América do Sul',   color:'#35e08a'},
  {id:'NAL',  tag:'NAL',   name:'North America League',     region:'América do Norte', color:'#00d2ff'},
  {id:'EML',  tag:'EML',   name:'Europe MENA League',       region:'Europa & MENA',    color:'#ffcc00'},
  {id:'CNL',  tag:'CNL',   name:'China National League',    region:'China',            color:'#ff6b57'},
  {id:'APLA', tag:'APL-A', name:'Asia Pacific League · Ásia',    region:'Ásia-Pacífico', color:'#ff7ad9'},
  {id:'APLN', tag:'APL-N', name:'Asia Pacific League · Norte',   region:'Ásia-Pacífico', color:'#c48bff'},
  {id:'APLO', tag:'APL-O', name:'Asia Pacific League · Oceania', region:'Ásia-Pacífico', color:'#6fe0d0'}
];

/* =====================================================================
   JOGADORES SEM CONTRATO E DO TIER 2 (aparecem no Mercado → "Agentes livres")
   Cada linha: [nick, origem, OVR, {opções}]
     origem   texto mostrado na lista (ex.: 'ex-NIP' ou 'Rebels Academy')
     OVR      rating do jogo (~60–80 para tier 2 e sem contrato); é ESTIMATIVA, ajuste à vontade
     opções   t2:1        jogador de time tier 2 sob contrato (custa o valor de mercado +10%);
                          sem t2 ele é "sem contrato" (custa 60% do valor)
              age:23, pot:82, role:'Entry'   idade, potencial e posição (se omitidos, o jogo define)
              aim:75, gs:70, clu:80, led:60, tw:70, roam:65, open:78, util:66, men:72, info:68, cons:74, adp:70
                          atributos específicos (todos opcionais; o resto o jogo gera). Ex.: ['Nick','ex-Time',72,{aim:78,clu:85}]
   Nick que já estiver em algum elenco é ignorado (para não duplicar a mesma pessoa). Se for OUTRO jogador com o
   mesmo nick, acrescente dup:1 nas opções: ['Wizard','ex-Time',70,{dup:1}]. Vale para carreiras novas.

   FONTE: Liquipedia (transferências de 01/08 a 19/09/2026). Situação de cada jogador
   conforme a ÚLTIMA movimentação registrada; "None" pode significar aposentadoria ou
   inatividade. Os OVRs são estimativas minhas, não vêm da fonte.
   Os cinco primeiros da seção "SEM CONTRATO · ex-tier 1" vêm de uma fonte anterior (SiegeGG,
   janela de fev/2026) e não tiveram a situação atual confirmada.
   ===================================================================== */
const POOL_ROWS = [

  /* ================= SEM CONTRATO · ex-tier 1 / mais fortes ================= */
  ['kondz','ex-NIP / Fluxo W7M',85,{age:24}],
  ['KangruKenny','ex-DarkZero',76],
  ['Coma','ex-DarkZero',75],
  ['reduct','ex-Team Liquid',74,{age:26}],
  ['Gryxr','ex-Oxygen Esports',80,{age:25}],
  ['Dora','ex-Team Heretics',74,{age:24}],
  ['Oscr','ex-Team Secret',73,{age:24}],

  /* ================= SEM CONTRATO · Brasil / América do Sul ================= */
  ['Muzi','ex-Dplus KIA',78,{age:25}],
  ['maquina','ex-Imperial Esports',71],
  ['yektz','ex-Imperial Esports',67],
  ['Florio','ex-Imperial Esports',66],
  ['Diniz','ex-Red Wolf Esports',66],
  ['LzZ','ex-Mystic Esports',66],
  ['patoxy','ex-SuperNova Team',72,{age:28}],
  ['Zorksz','ex-AdvoGatos E-Sports',65],
  ['Brtz','ex-AdvoGatos E-Sports',65],
  ['Gomess7','ex-Elevate Academy',76,{age:23}],
  ['LENDA','ex-Elevate Academy',73],
  ['hornetao','ex-Elevate Academy',76,{age:25}],
  ['Astro','Major Champion',75],
  ['Lukidera','Ex-MIBR',73],
  ['Nyjil','MIBR',70],


  /* ================= SEM CONTRATO · América do Norte ================= */
  ['Pengujn','ex-Karn & Co',68,{age:18}],
  ['Shmink','ex-TWC-XTRA',67],
  ['deen','ex-F5 Esports',67,{age:19}],
  ['Raccy','ex-F5 Esports',67,{age:21}],
  ['Toaster','ex-F5 Esports',66,{age:20}],
  ['Sylo','ex-For Fun Esports',66],
  ['CenGuns','ex-Kodex Esports',66],
  ['Chasezera','ex-Kodex Esports',66],
  ['ParaDice','ex-Kodex Esports',66],
  ['Rixz','ex-Kodex Esports',65],
  ['Stoaxy','ex-Kodex Esports',65],
  ['Dop4mine','ex-Oryn Academy',65],
  ['Los','ex-Oryn Academy',65],
  ['Pawz','ex-Oryn Academy',65],
  ['NoteGN','ex-Oryn Academy',64],
  ['Wizzerd','ex-Oryn Academy',64],
  ['Fearful','ex-Team Evictix',65],
  ['Effect','ex-Team Evictix',65],
  ['Regrets','ex-Team Evictix',65],
  ['Norcoz','ex-Team Evictix',64],
  ['DR01D','ex-Team Evictix',64],
  ['Kal','ex-Team Evictix',64],
  ['Civvi','ex-BitterSweet',65],
  ['sipzie','ex-BitterSweet',65],
  ['Navy','ex-Atlantis Esports',66],
  ['Yarlos','ex-Atlantis Esports',65,{age:21}],
  ['Stern','ex-Atlantis Esports',65,{age:25}],
  ['void.nn','ex-Atlantis Esports',65],
  ['Juhnova','ex-Atlantis Esports',64],
  ['Gods','ex-Atlantis Esports',64],
  ['ARY3R','ex-TTSS Esports',64],
  ['Acen','ex-TTSS Esports',64],
  ['Golden Skull','ex-TTSS Esports',63],
  ['That1Savage','ex-TTSS Esports',63],
  ['Teddy','ex-TWC-XTRA',65,{age:22}],
  ['reverse','ex-TWC-XTRA',65,{age:22}],
  ['BjL','ex-Arial Arise',64,{age:22}],
  ['ville','ex-Arial Arise',63],
  ['sleqt','ex-Arial Arise',63],
  ['Teak','ex-Overtake Sector',63],
  ['Valen','ex-Overtake Sector',63,{age:24}],
  ['Togglz','ex-Outlast (reserva)',64],

  /* ================= SEM CONTRATO · Europa & MENA ================= */
  ['yMk','ex-Good Intentions',68],
  ['garren','ex-Good Intentions',68],
  ['Ghostriddik','ex-Maestro Esca',66,{age:21}],
  ['rqnkr','ex-Maestro Esca',66],
  ['Rof','ex-Owned eSport',66,{age:21}],
  ['Nolf','ex-Owned eSport',66],
  ['Guardz','ex-Twisted Minds',66],
  ['Dov2hkiin','ex-Twisted Minds',66],
  ['Shvdxw','ex-Fans of Attics',65],
  ['Fantazy','ex-Honvéd',64,{age:22}],
  ['Slowz','ex-Honvéd',64],
  ['x.Ke','ex-Twisted Minds (reserva)',64,{age:25}],
  ['Disciple','ex-Beneath Reality',63,{age:21}],

  /* ================= SEM CONTRATO · China ================= */
  ['CPK','ex-Leviatán Esports',68],
  ['Douhua','ex-TYLOO',67],
  ['LyDA','ex-Four Angry Men',67],
  ['hynqt','ex-POZY',66],
  ['Sevente3n','ex-Titan Esports Club',66],
  ['Dominic','ex-LGD Gaming',66],
  ['Aetrsyna','ex-One Coin',66],
  ['K3','ex-PSYKN Company',66],
  ['KarTy','ex-PSYKN Company',66,{age:20}],
  ['Neon','ex-PSYKN Company',65,{age:23}],
  ['Wagurisan','ex-PSYKN Company',65],
  ['Chichoo','ex-POZY',65],
  ['Fakekun','ex-POZY',65],

  /* ================= SEM CONTRATO · Ásia-Pacífico ================= */
  ['ShibeNuts','ex-Elevate',67],
  ['HysteRiX','ex-Elevate',67,{age:27}],
  ['BarcodeOP','ex-Elevate',66],
  ['Duo','ex-RRX',66,{age:24}],
  ['Qikcs','ex-7VEN',66],
  ['Farlord','ex-FURY',65,{age:23}],
  ['Goppi','ex-Can You Be My Enemy',65],
  ['Marimo','ex-Can You Be My Enemy',65],
  ['Kiyoshi','ex-Leftovers',64],
  ['AwayG','ex-FURY Academy',63],
  ['Alluka','ex-Elevate Academy APAC',63],
  ['DCH','ex-Soul\'s Heart Esport',63,{age:25}],
  ['Realers','ex-Shaiikademy',63],
  ['Snow','ex-Arcade Esports',63],
  ['Triipn','ex-Circular Spheres',63,{age:25}],

  /* ================= TIER 2 · América do Sul ================= */
  ['Khaotyc','Mystic Esports',65,{t2:1}],
  ['verinhasObrabo','Mystic Esports',65,{t2:1}],
  ['Raio','Red Wolf Esports',65,{age:21,t2:1}],
  ['DuduCRVG','Red Wolf Esports',65,{t2:1}],
  ['Jango','9z Team',66,{t2:1}],
  ['Soco','9z Team',66,{age:24,t2:1}],
  ['lioo','9z Team',65,{t2:1}],
  ['Darkeyss','SuperNova Team',75,{age:22,t2:1}],
  ['enzao','AdvoGatos E-Sports',65,{t2:1}],
  ['ttodyz','AdvoGatos E-Sports',65,{t2:1}],
  ['Algarte','AdvoGatos E-Sports',64,{t2:1}],
  ['semper','AdvoGatos E-Sports',71,{age:20,t2:1}],

  /* ================= TIER 2 · América do Norte ================= */
  ['Slinky','BitterSweet',67,{t2:1}],
  ['Trist','BitterSweet',67,{t2:1}],
  ['Vinny','BitterSweet',66,{t2:1}],
  ['Buzz','BitterSweet',66,{t2:1}],
  ['bubly','BitterSweet',66,{t2:1}],
  ['Clutxh','BitterSweet',66,{t2:1}],
  ['yleqi','Team Evictix',66,{age:19,t2:1}],
  ['ionz','Team Evictix',66,{age:22,t2:1}],
  ['Spiff','Team Evictix',66,{age:21,t2:1}],
  ['Glybo','Team Evictix',66,{t2:1}],
  ['Wifi','Team Evictix',65,{t2:1}],
  ['Kixhro','Aelix',67,{t2:1}],
  ['TK','Aelix',67,{age:26,t2:1}],
  ['Badjur','Aelix',66,{t2:1}],
  ['Kixa','Aelix',66,{age:18,t2:1}],
  ['Darkkwga','Aelix Academy',64,{age:20,t2:1}],
  ['Fiyios','Aelix Academy',64,{t2:1}],
  ['Strudle','Aelix Academy',64,{t2:1}],
  ['Riolol','Aelix Academy',64,{t2:1}],
  ['Omii','Aelix Academy',64,{t2:1}],
  ['HyDka','Kodex Esports',68,{t2:1}],
  ['SoggyC','Kodex Esports',68,{t2:1}],
  ['Oyasumi','Kodex Esports',67,{t2:1}],
  ['Ricci','Kodex Esports',67,{t2:1}],
  ['Focal','Kodex Esports',67,{t2:1}],
  ['bootz','FYR Strays',67,{t2:1}],
  ['Franklin','FYR Strays',67,{age:22,t2:1}],
  ['jayyguns','FYR Strays',66,{t2:1}],
  ['Loo','FYR Strays',66,{t2:1}],
  ['Mingo','FYR Strays',66,{age:24,t2:1}],
  ['Artix','InControl',68,{age:19,t2:1}],
  ['Djevn','InControl',68,{t2:1}],
  ['Muki','InControl',67,{t2:1}],
  ['Pouldy','InControl',67,{t2:1}],
  ['rinn','InControl',67,{t2:1}],
  ['Slashh','Team Cynical Pink',65,{age:19,t2:1}],
  ['YungGurv','Team Cynical Pink',65,{t2:1}],
  ['Sneky','Team Cynical Pink',65,{t2:1}],
  ['Zman','Team Cynical Pink',64,{age:19,t2:1}],
  ['sha','Team Cynical Pink',64,{t2:1}],
  ['ReZzii','Divine Corp',66,{t2:1}],
  ['Bippin','Divine Corp',66,{t2:1}],
  ['Bummy','Divine Corp',65,{t2:1}],
  ['Cloudy','Divine Corp',65,{age:23,t2:1}],
  ['Tango','Divine Corp',65,{t2:1}],
  ['rothermel','1HP',66,{t2:1}],
  ['Foresight','1HP',66,{age:23,t2:1}],
  ['Deity','1HP',66,{t2:1}],
  ['Kyred','1HP',65,{t2:1}],
  ['Lucki','1HP',65,{t2:1}],
  ['Brae','Karn & Co',65,{t2:1}],
  ['NickB2A','Nokturns',64,{age:22,t2:1}],
  ['Ymir','Zen Esports',64,{t2:1}],
  ['VicBands','Hakikimori',64,{t2:1}],
  ['Repys','ex-Vessel Esports',65,{t2:1}],
  ['Keithh','ex-Vessel Esports',65,{t2:1}],
  ['Obsesixn','ex-Vessel Esports',64,{t2:1}],
  ['Artnic','ex-Vessel Esports',64,{t2:1}],
  ['vLst','ex-Vessel Esports',64,{t2:1}],
  ['PakhtoonKid','For Fun Esports Academy',64,{t2:1}],

  /* ================= TIER 2 · Europa & MENA ================= */
  ['Shft','Team Secret Academy',70,{t2:1}],
  ['LoNLYq','Team Secret Academy',70,{t2:1}],
  ['Rawa','Team Secret Academy',69,{t2:1}],
  ['d0mantas','Team Secret Academy',69,{age:23,t2:1}],
  ['Flexy','Team Secret Academy',69,{t2:1}],
  ['Melocy','Valid Unit',69,{t2:1}],
  ['Tyl','Valid Unit',69,{t2:1}],
  ['Rollojce','Valid Unit',68,{t2:1}],
  ['Fitzy','Valid Unit',68,{t2:1}],
  ['ProLikes','Valid Unit',68,{age:20,t2:1}],
  ['Vacuna','Valid Unit (reserva)',66,{t2:1}],
  ['REHTI','Entropy Gaming',68,{t2:1}],
  ['Duffers','Entropy Gaming',68,{t2:1}],
  ['Makzito','Entropy Gaming',67,{t2:1}],
  ['joosi','Entropy Gaming',67,{t2:1}],
  ['rexyze','Entropy Gaming',67,{t2:1}],
  ['Bal0uX','Soul\'s Heart EU',67,{age:25,t2:1}],
  ['Esteban','Soul\'s Heart EU',67,{t2:1}],
  ['Apak','Soul\'s Heart EU',66,{t2:1}],
  ['Fire','Soul\'s Heart EU',66,{age:26,t2:1}],
  ['BMS','Soul\'s Heart EU',66,{age:25,t2:1}],
  ['KrowX','WASP ESPORT',66,{t2:1}],
  ['kbrd','WASP ESPORT',66,{t2:1}],
  ['Alxreee','WASP ESPORT',65,{t2:1}],
  ['Yaxs','WASP ESPORT',65,{t2:1}],
  ['Glock','Honvéd',66,{age:18,t2:1}],
  ['Azzr','Honvéd',66,{t2:1}],
  ['Kendrew','Honvéd (reserva)',64,{age:27,t2:1}],
  ['Layton','Honvéd (reserva)',64,{t2:1}],
  ['Lowkyy','Owned eSport',65,{age:23,t2:1}],
  ['Mvv','Owned eSport',65,{age:21,t2:1}],
  ['tucanQ','Fans of Attics',65,{t2:1}],
  ['Oli','Fans of Attics',65,{t2:1}],
  ['RockNRollDJ','Good Intentions',66,{t2:1}],
  ['Crex','Good Intentions (reserva)',64,{t2:1}],
  ['Tazzy','Maestro Esca',65,{t2:1}],
  ['Shiinka','Maestro Esca',65,{age:28,t2:1}],
  ['Minnie','Beneath Reality',64,{t2:1}],
  ['Radenty','Project X',64,{t2:1}],

  /* ================= TIER 2 · China ================= */
  ['KIRs','Ever Growing Gaming',66,{t2:1}],
  ['Demon4','Ever Growing Gaming',66,{t2:1}],
  ['Sa1tyyyy-','Ever Growing Gaming',65,{t2:1}],
  ['Jxffy','Ever Growing Gaming',65,{t2:1}],
  ['May10th','Ever Growing Gaming',65,{t2:1}],
  ['LIKE','TYLOO Academy',65,{t2:1}],

  /* ================= TIER 2 · Ásia-Pacífico ================= */
  ['HOXLAST','Dolphin Esport (reserva)',64,{t2:1}],
  ['Nongju','Dolphin Esport (reserva)',64,{t2:1}],
  ['ZOSHAV','Sharper Esports (reserva)',64,{age:21,t2:1}],
  ['xCerlotic','Sharper Esports (reserva)',64,{age:26,t2:1}],
  ['pakie','999 (reserva)',64,{age:27,t2:1}],
  ['Duck','FURY Academy',63,{t2:1}],
  ['Haitcha','Wolves Esports',66,{t2:1}],
  ['Kxttsu','Wolves Esports',66,{t2:1}],
  ['Wolfsta','Wolves Esports',65,{t2:1}],
  ['Sweat','Wolves Esports',65,{t2:1}],
  ['Desertaat','Wolves Esports',65,{t2:1}],
  ['Fxulty','Wolves Esports (reserva)',64,{t2:1}],
  ['Jackscurry','Circular Planets',65,{t2:1}],
  ['Madulla','Circular Planets',65,{t2:1}],
  ['Orion','7VEN (reserva)',64,{t2:1}],
  ['Scarrs','Man eSports LFO (reserva)',64,{t2:1}],
  ['Culture','Shaiikademy (reserva)',63,{t2:1}]
];

const TEAM_ROWS = [
  // ---- SAL ----
  ['fluxo','Fluxo W7M','W7M','SAL',91,'Paluh:Entry=95{age:26},Lobin:Flex=91{age:23},dotz*=86{age:25},HATEZ:Sup1=88{age:23},Fntzy:Entry=88{age:23}',{tag:'W7M',color:'#ffb100',src:1,coach:'thug (analista: Dan)',note:'Elenco reformulado em 31/08'}],
  ['faze','FaZe Clan','FaZe','SAL',96,'Cyber:Entry=99{age:28},KDS:Entry=96{age:25},Handyy:Flex=98{age:23},Soulz1:Sup1=96{age:25},Vitaking*=96{age:24}',{rivals:['furia','liquid'],tag:'FZ',color:'#ff3b3b',src:1,ewc:1}],
  ['liquid','Team Liquid Alienware','Liquid','SAL',89,'FelipoX*=88{age:24},Kheyze:Entry=97{age:24},Maia:Entry=94{age:24},Jv92:Flex=92{age:23},nade:Sup1=91{age:23}',{tag:'TL',color:'#3aa0ff',src:1}],
  ['furia','FURIA','FURIA','SAL',91,'HerdsZ:Entry=95{age:26},DiasLucas:Sup1=92{age:24},volpz*=94{age:23},Loira:Entry=91{age:21},Bokzera:Flex=93{age:20}',{rivals:['fluxo'],tag:'FUR',color:'#e8e8e8',src:1}],
  ['loud','LOUD','LOUD','SAL',84,'live*=86{age:26},Flastry:Sup1=86{age:24},resetz:Sup2=84{age:23},Stemp:Entry=86,Gabu:Flex=83',{tag:'LLL',color:'#35e08a'}],
  ['los','LOS','LOS','SAL',84,'Dash*=88{age:24},peres:Entry=88{age:23},Nuxxga:Sup1=84,Daffodil:Flex=84{age:22},Dodez:Entry=87{age:25}',{tag:'LOS',color:'#ffd23f'}],
  ['l5','Lucky Five','L5','SAL',82,'Psycho:Sup1=82{age:27},pino:Flex=81{age:25},Bassetto*=89{age:25},Neskin:Flex=81{age:24},Wizard:Sup2=83',{tag:'L5',color:'#7be07b'}],
  ['bd','Black Dragons','B. Dragons','SAL',83,'R4re*=80{age:24},Romeo:Sup2=85{age:32},Mr6otlaw:Entry=83,Swag:Entry=79{age:24},Guto:Sup1=84',{tag:'BD',color:'#d94d4d'}],
  ['imp','Imperial Esports','Imperial','SAL',79,'xS3xyCake*=82{age:27},NearZ:Flex=80{age:22},mitrix:Sup1=76,Legacy:Sup2=79,Hasaqui:Entry=78',{tag:'IMP',color:'#5aa7ff'}],
  ['intz','INTZ','INTZ','SAL',78,'Rappz:Sup1=77{age:24},Ar7hr:Sup2=83{age:24},naka*=81,Stk:Entry=79{age:25},AngelzZ:Entry=85',{tag:'INT',color:'#4f7cff'}],
  // ---- NAL ----
  ['dz','DarkZero Esports','DarkZero','NAL',92,'Fultz*=93{age:25},njr:Flex=89{age:24},J9O:Sup1=95{age:24},Kyno:Sup2=91{age:24},Nuers:Entry=92{age:23}|Koshi=87',{rivals:['m80','wild'],tag:'DZ',color:'#ff5a1f',src:1,note:'Campeã de Major'}],
  ['wild','Wildcard Gaming','Wildcard','NAL',91,'Kanzen:Entry=92{age:24},Spiker*=94{age:21},Bae:Entry=88{age:21},Adrian:Sup1=91{age:21},bbySharKK:Flex=90{age:21}',{tag:'WC',color:'#b06cff',src:1,note:'Campeã do Stage 1'}],
  ['m80','M80','M80','NAL',89,'Gunnar:Flex=89{age:22},Savage*=92{age:22},Gaveni:Entry=88{age:24},Ashn:Entry=86{age:21},dfuzr:Flex=90{age:21}',{tag:'M80',color:'#ff9d00',src:1,coach:'Fabian'}],
  ['shop','Shopify Rebellion','Shopify','NAL',87,'Canadian*=80{age:30},Spoit:Entry=87{age:22},Rexen:Entry=89{age:27},Surf:Sup1=90{age:23},Ambi:Entry=89{age:20}',{tag:'SR',color:'#8fd14f'}],
  ['c9','Cloud9','Cloud9','NAL',87,'Monk:Sup1=84{age:20},Panbazou:Entry=88{age:23},Eddy*=90,Centir:Flex=86{age:21},EWZY:Sup2=87',{rivals:['100t'],tag:'C9',color:'#3ec3ff'}],
  ['100t','100 Thieves','100T','NAL',86,'Hotancold*=86{age:28},GMZ:Entry=85{age:23},SpiriTz:Entry=89{age:24},Atom:Flex=87,Kason:Sup1=83{age:18}',{tag:'100',color:'#ff4d5e'}],
  ['ssg','Spacestation Gaming','SSG','NAL',85,'Dream*=84{age:27},Gity:Sup1=86,Rival:Flex=88{age:22},Aiden:Flex=85{age:20},Raid:Entry=82',{tag:'SSG',color:'#5aa7ff'}],
  ['outlast','Outlast','Outlast','NAL',81,'JoyStiCK:Entry=84{age:27},iconic*=78{age:24},Trevmak:Sup1=82,Tyrant:Entry=80{age:26},Mili:Flex=81',{tag:'OL',color:'#ffb347'}],
  ['ff','Five Fears','Five Fears','NAL',80,'Forrest:Sup1=80{age:26},JJBlazt*=79{age:22},Snake:Entry=77,FENZ:Flex=81{age:22},Riv4l:Sup2=83',{tag:'5F',color:'#e0e0e0'}],
  ['fun','For Fun Esports','For Fun','NAL',79,'Beeno:Sup1=78{age:23},Packer*=79{age:22},MikeW:Sup2=76,Vulspur:Entry=80,Serx:Flex=82{age:18}',{tag:'FF',color:'#ffd166'}],
  // ---- EML ----
  ['falcons','Team Falcons','Falcons','EML',93,'BriD:Sup1=90{age:30},Yuzus:Flex=93{age:26},jume:Flex=93{age:23},LikEfac*=94{age:23},Solotov:Flex=92{age:25}',{rivals:['shifters'],tag:'FLC',color:'#33d17a',src:1,note:'Campeões europeus'}],
  ['shifters','Shifters (ex-Team BDS)','Shifters','EML',93,'CTZN:Flex=92{age:27},Nafe*=88{age:25},Freq:Flex=88{age:22},DEADSHT:Sup1=93{age:24},Robby:Entry=90{age:21}',{tag:'BDS',color:'#ff3fa4',src:1,ex:'Team BDS rebatizada em 15/12/2025'}],
  ['g2','G2 Esports','G2','EML',89,'Shaiiko:Entry=95{age:27},Doki:Entry=89{age:26},Benjamaster:Flex=94{age:23},Alem4o*=86{age:24},Stompn:Sup1=91{age:19}',{rivals:['fnatic'],tag:'G2',color:'#ff5c5c',src:1,star:'Shaiiko'}],
  ['vp','Virtus.pro','VP','EML',86,'dan:Entry=87{age:25},p4sh4*=89{age:25},RORICK:Flex=86{age:24},SkyZs:Sup1=83,Nayqo:Sup2=85',{tag:'VP',color:'#ffb347'}],
  ['secret','Team Secret','Secret','EML',86,'Hungry*=89{age:30},Noa:Entry=83{age:22},CroqSon:Entry=87{age:22},Creedz:Flex=86{age:21},Drillz:Flex=85',{tag:'TS',color:'#e5e5e5'}],
  ['fnatic','Fnatic','Fnatic','EML',85,'Deapek*=88{age:26},Dante7:Entry=82{age:23},Wizard:Sup1=85,DJ:Sup2=86,Sm1ss:Flex=84{age:22}',{tag:'FNC',color:'#ff8a1f'}],
  ['heretics','Team Heretics','Heretics','EML',84,'Aqui*=87{age:24},Skeptic:Flex=83,Lollo:Sup2=81{age:23},Lasmooo:Sup1=85{age:20},MATZ:Entry=84|Zaaramy=81{age:19}',{tag:'TH',color:'#c9a227'}],
  ['geekay','Geekay Esports','Geekay','EML',83,'Yoggah:Entry=82{age:24},AsK*=88{age:24},Gruby:Entry=83{age:23},Eupor:Flex=86{age:22},Sarks:Flex=80{age:23}',{tag:'GK',color:'#ffe135'}],
  ['tm','Twisted Minds','Twisted','EML',82,'BlaZ:Flex=82{age:25},Tr1ixd:Sup1=85{age:23},Hashom:Sup2=79{age:22},Mowwwgli:Entry=93{age:23},jlaDD*=81',{tag:'TM',color:'#8ad0ff'}],
  ['rebels','Rebels Gaming','Rebels','EML',80,'Elemzje:Sup1=77{age:30},Linkoo:Entry=81,Asa:Flex=79{age:23},Marteau*=83,Feno:Sup2=80|leadjay=74',{tag:'RBL',color:'#ff6b6b'}],
  // ---- CNL ----
  ['ag','All Gamers','AG','CNL',85,'Mcie:Flex=86,MoonL1ght:Entry=82,Ra3LGuN:Sup1=84,SoloMiD*=88,YaaaaZ:Sup2=85',{rivals:['edg'],tag:'AG',color:'#ff4d5e'}],
  ['edg','EDward Gaming','EDG','CNL',84,'Direction*=83,OnJuly:Sup1=81,Bapn:Flex=85{age:21},Carpe:Entry=87,Reif:Sup2=84|Mo5quito=81',{tag:'EDG',color:'#e0e0e0'}],
  ['kz','KINGZERO eSports','KINGZERO','CNL',83,'MomoWiNGs:Sup1=80,KzB:Flex=83,Fiber*=82,Sunset:Entry=86{age:24},Wick:Sup2=84',{tag:'KZ',color:'#ffd166'}],
  ['tyloo','TYLOO','TYLOO','CNL',82,'Jackywu:Sup1=81{age:23},Songla:Entry=79{age:22},ABEI*=83,AurK11:Sup2=85,Austin:Flex=82',{tag:'TYL',color:'#ffd166'}],
  ['lev','Leviatán Esports','Leviatán','CNL',80,'Bullet1:Sup1=79{age:27},SHADOW:Flex=81{age:24},Binbin:Sup2=80,ArFeng:Entry=77,DEMoZ*=83{age:19}',{tag:'LEV',color:'#a06bff'}],
  ['fam','Four Angry Men','4AM','CNL',80,'rockstarKa:Sup1=81,txonly:Flex=83,ShaZ5ibe:Entry=80,Asylum*=77,Yoviker:Sup2=79|Logan=77',{tag:'4AM',color:'#ff7a45'}],
  ['titan','Titan Esports Club','Titan','CNL',79,'A1mer*=82,Rusher:Flex=78,Arcox:Sup1=76,KINA1:Entry=79,bottomLove:Sup2=80',{tag:'TTN',color:'#55e6c1'}],
  ['lgd','LGD Gaming','LGD','CNL',78,'J1ahao:Sup1=81,KY:Flex=75,Pau1:Sup2=78,wantto:Entry=77,MavDEMON*=79',{tag:'LGD',color:'#4f7cff'}],
  ['coin','One Coin','One Coin','CNL',78,'BigJ:Sup1=79,Darcly:Flex=75,SDGundam*=81,Akira:Entry=78,History:Sup2=77',{tag:'1C',color:'#ffb300'}],
  ['pozy','POZY','POZY','CNL',77,'NRea117:Flex=76,POPO:Entry=78,ZOZ:Sup1=77,Su1:Sup2=74,N9istr*=80',{tag:'PZY',color:'#6fd3ff'}],
  // ---- APL Ásia ----
  ['wbg','Weibo Gaming','Weibo','APLA',84,'SpeakEasy:Entry=93{age:26},Gotti*=84{age:23},Reeps96:Sup1=92{age:23},Hovenherst:Sup2=85{age:23},Terd:Flex=81{age:21}',{tag:'WBG',color:'#ff7a45'}],
  ['elv','Elevate','Elevate','APLA',80,'TOLJI:Sup2=80{age:24},Scatman:Sup1=81{age:28},MrPuncH:Entry=77{age:22},Ape:Flex=79{age:22},Nhaiqal*=83{age:20}',{tag:'ELV',color:'#ffd23f'}],
  ['999','999','999','APLA',78,'JayDog:Entry=77{age:19},JyuB:Flex=81{age:21},Miku:Sup1=78,Staxsta*=79{age:19},Sowhat:Entry=75{age:22}|Shiba=72{age:25}',{tag:'999',color:'#e0e0e0'}],
  ['fury','FURY','FURY','APLA',77,'Roldinii*=80,Darkk:Flex=74{age:25},Markelelele:Entry=78{age:25},LebyRinth:Sup1=77{age:24},Kaneki:Sup2=76',{tag:'FRY',color:'#ff4d5e'}],
  ['daystar','Daystar','Daystar','APLA',76,'Souffle:Entry=75{age:26},Pikan*=77{age:25},Seal:Sup1=76,AZuKi:Flex=79{age:20},Yao:Sup2=73{age:20}',{tag:'DAY',color:'#ffb347'}],
  ['dolph','Dolphins Esports','Dolphins','APLA',76,'ZISTZ:Flex=77{age:25},SUNSTRIKE*=79,KI11ERz:Sup1=73{age:26},TeNnO:Entry=75,Chattonounmei:Sup2=76{age:22}',{tag:'DOL',color:'#3aa0ff'}],
  ['sharper','Sharper Esports','Sharper','APLA',75,'Lycolis*=78{age:27},Nay.Pew:Flex=75,BGMan:Sup1=74{age:26},KritJ:Entry=76{age:22},Peeps:Sup2=72',{tag:'SHP',color:'#7be07b'}],
  ['lo','leftovers','leftovers','APLA',74,'Jittery:Sup1=73,xedux*=77,Yannis:Flex=75{age:20},Edward:Entry=74,klz:Sup2=71{age:18}',{tag:'LFT',color:'#c48bff'}],
  // ---- APL Norte ----
  ['dplus','Dplus KIA','Dplus KIA','APLN',85,'Mity*=86{age:28},ion:Flex=82{age:26},Levy:Flex=88{age:27},Faallz:Sup1=84{age:27},yurivst:Sup2=85',{tag:'DK',color:'#00d2ff'}],
  ['cag','CAG by VARREL','CAG','APLN',81,'Anitun*=78{age:25},Chibisu:Entry=80{age:22},Zaka:Sup1=84,DD:Flex=82{age:25},ShuReap:Entry=81{age:23}',{tag:'CAG',color:'#ff9d00'}],
  ['trippy','TRIPPY','TRIPPY','APLN',79,'Demic:Flex=79{age:29},Harp3rXD:Sup1=80{age:24},Arukaze:Flex=82{age:24},NL:Sup2=76{age:23},DOCHI*=78{age:21}|munu74=75{age:22}',{tag:'TRP',color:'#b06cff'}],
  ['scarz','SCARZ','SCARZ','APLN',78,'Rec:Entry=75{age:24},Wqsyo1:Entry=81{age:24},FishLike*=77{age:23},Nina:Sup1=79{age:21},YuKiz:Flex=78{age:22}',{tag:'SZ',color:'#ff4d5e'}],
  ['fearx','FearX','FearX','APLN',78,'Soldier:Sup1=78{age:24},Woogiman*=79{age:23},JLT:Entry=81{age:26},Rider:Entry=77{age:23},EunSang:Flex=75{age:21}',{tag:'FX',color:'#ffd166'}],
  ['rrx','RRX','RRX','APLN',77,'Akusu:Sup1=77{age:22},maou:Sup2=76{age:22},Yuyu:Entry=78,JiNm*=80{age:24},KoroMomo:Flex=74',{tag:'RRX',color:'#e0e0e0'}],
  ['cybme','Can You Be My Enemy','CYBME','APLN',76,'Yanagi:Sup1=79,AsveL:Sup2=77,sikiNNGO*=76,NOVASHATOL:Entry=75,Toki:Flex=73',{tag:'CYB',color:'#6fd3ff'}],
  ['kino','KINOTROPE gaming','KNT','APLN',75,'gatorada:Entry=72{age:26},Ayagator:Flex=76{age:25},Eclair*=78{age:25},Aokayu:Sup2=74{age:26},Kawa:Sup1=75{age:24}',{tag:'KNT',color:'#55e6c1'}],
  // ---- APL Oceania ----
  ['chiefs','Chiefs Esports Club','Chiefs','APLO',82,'Wettables:Sup1=81{age:26},Neptune*=85{age:23},Jakenna:Flex=82,Relaes:Entry=83{age:20},Lunchbox:Sup2=79',{tag:'CHF',color:'#ff4d5e'}],
  ['ent','ENTERPRISE Esports','ENTERPRISE','APLO',81,'Jigsaw:Entry=78{age:25},Kyro*=80,Tuhan:Flex=81{age:23},Brendo:Sup1=82,Playxr:Sup2=84{age:22}',{tag:'ENT',color:'#ffd23f'}],
  ['7ven','7VEN','7VEN','APLO',79,'Presidnt:Flex=76,Pinku:Sup1=78,Baele:Sup2=79,Walsh*=80,Tukk:Entry=82',{tag:'7VN',color:'#a06bff'}],
  ['man','Man eSports LFO','Man','APLO',77,'Huntr:Entry=76,Pluto:Sup1=78{age:23},Sharkie*=80,Elementz:Sup2=77,Beers:Flex=74',{tag:'MAN',color:'#ff9d00'}],
  ['anios','Team Anios','Anios','APLO',76,'ChefJeff:Entry=76{age:24},erazer:Sup1=75,Proxy:Sup2=73,Machine*=79,Acog:Flex=77',{tag:'ANI',color:'#3aa0ff'}],
  ['arcade','Arcade Esports','Arcade','APLO',75,'Japer:Sup1=74,FZICS:Sup2=72,Loyalth:Entry=76,Aserz*=75,Syrro:Flex=78',{tag:'ARC',color:'#7be07b'}],
  ['shaiik','Shaiikademy','Shaiikademy','APLO',74,'KKin:Entry=75{age:24},Wizard*=71,Shaz:Sup1=74,Rhqnz:Flex=77,Kynvx:Sup2=73',{tag:'SHA',color:'#ff7ad9'}],
  ['sphere','Circular Spheres','Spheres','APLO',73,'Kqrma*=76{age:22},GOOOFT:Sup1=73,Sword:Flex=72{age:19},Nezerati:Sup2=70,Palarazi:Entry=74',{tag:'CS',color:'#6fe0d0'}]
];
