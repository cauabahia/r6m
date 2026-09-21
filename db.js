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
                Nick:Entry     → função: Entry, Flex, Support, Anchor ou Roamer
                Nick*:Support  → IGL e função
              Sem marca, a função é sorteada pelo jogo e o jogador NÃO é IGL.
              ex.: 'Cyber:Entry,KDS:Flex,Handyy:Roamer,Soulz1:Anchor,Vitaking*:Support'
     opções   tag:'ABC'   sigla no escudo (até 3–4 letras)
              color:'#hex' cor do time
              src:1        marca o poder como "informado por você" (sem isso aparece "~ estimativa")
              ewc:1        campeão da EWC (ganha +400 SI Points e o troféu 🏆 na 1ª temporada)
              star:'Nick'  jogador-estrela (rating mais alto do time; mais caro no mercado)
              coach:'…', note:'…', ex:'…'   textos informativos
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
              age:23, pot:82, role:'Entry'   idade, potencial e função (se omitidos, o jogo define)
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
  ['kondz','ex-NIP / Fluxo W7M',85],
  ['KangruKenny','ex-DarkZero',76],
  ['Coma','ex-DarkZero',75],
  ['reduct','ex-Team Liquid',74],
  ['Gryxr','ex-Oxygen Esports',80],
  ['Dora','ex-Team Heretics',74],
  ['Oscr','ex-Team Secret',73],

  /* ================= SEM CONTRATO · Brasil / América do Sul ================= */
  ['Muzi','ex-Dplus KIA',78],
  ['maquina','ex-Imperial Esports',71],
  ['yektz','ex-Imperial Esports',67],
  ['Florio','ex-Imperial Esports',66],
  ['Diniz','ex-Red Wolf Esports',66],
  ['LzZ','ex-Mystic Esports',66],
  ['patoxy','ex-SuperNova Team',72],
  ['Zorksz','ex-AdvoGatos E-Sports',65],
  ['Brtz','ex-AdvoGatos E-Sports',65],
  ['Gomess7','ex-Elevate Academy',76],
  ['LENDA','ex-Elevate Academy',73],
  ['hornetao','ex-Elevate Academy',76],
  ['Astro','Major Champion',75],
  ['Lukidera','Ex-MIBR',73],
  ['Nyjil','MIBR',70],


  /* ================= SEM CONTRATO · América do Norte ================= */
  ['Pengujn','ex-Karn & Co',68],
  ['Shmink','ex-TWC-XTRA',67],
  ['deen','ex-F5 Esports',67],
  ['Raccy','ex-F5 Esports',67],
  ['Toaster','ex-F5 Esports',66],
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
  ['Yarlos','ex-Atlantis Esports',65],
  ['Stern','ex-Atlantis Esports',65],
  ['void.nn','ex-Atlantis Esports',65],
  ['Juhnova','ex-Atlantis Esports',64],
  ['Gods','ex-Atlantis Esports',64],
  ['ARY3R','ex-TTSS Esports',64],
  ['Acen','ex-TTSS Esports',64],
  ['Golden Skull','ex-TTSS Esports',63],
  ['That1Savage','ex-TTSS Esports',63],
  ['Teddy','ex-TWC-XTRA',65],
  ['reverse','ex-TWC-XTRA',65],
  ['BjL','ex-Arial Arise',64],
  ['ville','ex-Arial Arise',63],
  ['sleqt','ex-Arial Arise',63],
  ['Teak','ex-Overtake Sector',63],
  ['Valen','ex-Overtake Sector',63],
  ['Togglz','ex-Outlast (reserva)',64],

  /* ================= SEM CONTRATO · Europa & MENA ================= */
  ['yMk','ex-Good Intentions',68],
  ['garren','ex-Good Intentions',68],
  ['Ghostriddik','ex-Maestro Esca',66],
  ['rqnkr','ex-Maestro Esca',66],
  ['Rof','ex-Owned eSport',66],
  ['Nolf','ex-Owned eSport',66],
  ['Guardz','ex-Twisted Minds',66],
  ['Dov2hkiin','ex-Twisted Minds',66],
  ['Shvdxw','ex-Fans of Attics',65],
  ['Fantazy','ex-Honvéd',64],
  ['Slowz','ex-Honvéd',64],
  ['x.Ke','ex-Twisted Minds (reserva)',64],
  ['Disciple','ex-Beneath Reality',63],

  /* ================= SEM CONTRATO · China ================= */
  ['CPK','ex-Leviatán Esports',68],
  ['Douhua','ex-TYLOO',67],
  ['LyDA','ex-Four Angry Men',67],
  ['hynqt','ex-POZY',66],
  ['Sevente3n','ex-Titan Esports Club',66],
  ['Dominic','ex-LGD Gaming',66],
  ['Aetrsyna','ex-One Coin',66],
  ['K3','ex-PSYKN Company',66],
  ['KarTy','ex-PSYKN Company',66],
  ['Neon','ex-PSYKN Company',65],
  ['Wagurisan','ex-PSYKN Company',65],
  ['Chichoo','ex-POZY',65],
  ['Fakekun','ex-POZY',65],

  /* ================= SEM CONTRATO · Ásia-Pacífico ================= */
  ['ShibeNuts','ex-Elevate',67],
  ['HysteRiX','ex-Elevate',67],
  ['BarcodeOP','ex-Elevate',66],
  ['Duo','ex-RRX',66],
  ['Qikcs','ex-7VEN',66],
  ['Farlord','ex-FURY',65],
  ['Goppi','ex-Can You Be My Enemy',65],
  ['Marimo','ex-Can You Be My Enemy',65],
  ['Kiyoshi','ex-Leftovers',64],
  ['AwayG','ex-FURY Academy',63],
  ['Alluka','ex-Elevate Academy APAC',63],
  ['DCH','ex-Soul\'s Heart Esport',63],
  ['Realers','ex-Shaiikademy',63],
  ['Snow','ex-Arcade Esports',63],
  ['Triipn','ex-Circular Spheres',63],

  /* ================= TIER 2 · América do Sul ================= */
  ['Khaotyc','Mystic Esports',65,{t2:1}],
  ['verinhasObrabo','Mystic Esports',65,{t2:1}],
  ['Raio','Red Wolf Esports',65,{t2:1}],
  ['DuduCRVG','Red Wolf Esports',65,{t2:1}],
  ['Jango','9z Team',66,{t2:1}],
  ['Soco','9z Team',66,{t2:1}],
  ['lioo','9z Team',65,{t2:1}],
  ['Darkeyss','SuperNova Team',75,{t2:1}],
  ['enzao','AdvoGatos E-Sports',65,{t2:1}],
  ['ttodyz','AdvoGatos E-Sports',65,{t2:1}],
  ['Algarte','AdvoGatos E-Sports',64,{t2:1}],
  ['semper','AdvoGatos E-Sports',71,{t2:1}],

  /* ================= TIER 2 · América do Norte ================= */
  ['Slinky','BitterSweet',67,{t2:1}],
  ['Trist','BitterSweet',67,{t2:1}],
  ['Vinny','BitterSweet',66,{t2:1}],
  ['Buzz','BitterSweet',66,{t2:1}],
  ['bubly','BitterSweet',66,{t2:1}],
  ['Clutxh','BitterSweet',66,{t2:1}],
  ['yleqi','Team Evictix',66,{t2:1}],
  ['ionz','Team Evictix',66,{t2:1}],
  ['Spiff','Team Evictix',66,{t2:1}],
  ['Glybo','Team Evictix',66,{t2:1}],
  ['Wifi','Team Evictix',65,{t2:1}],
  ['Kixhro','Aelix',67,{t2:1}],
  ['TK','Aelix',67,{t2:1}],
  ['Badjur','Aelix',66,{t2:1}],
  ['Kixa','Aelix',66,{t2:1}],
  ['Darkkwga','Aelix Academy',64,{t2:1}],
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
  ['Franklin','FYR Strays',67,{t2:1}],
  ['jayyguns','FYR Strays',66,{t2:1}],
  ['Loo','FYR Strays',66,{t2:1}],
  ['Mingo','FYR Strays',66,{t2:1}],
  ['Artix','InControl',68,{t2:1}],
  ['Djevn','InControl',68,{t2:1}],
  ['Muki','InControl',67,{t2:1}],
  ['Pouldy','InControl',67,{t2:1}],
  ['rinn','InControl',67,{t2:1}],
  ['Slashh','Team Cynical Pink',65,{t2:1}],
  ['YungGurv','Team Cynical Pink',65,{t2:1}],
  ['Sneky','Team Cynical Pink',65,{t2:1}],
  ['Zman','Team Cynical Pink',64,{t2:1}],
  ['sha','Team Cynical Pink',64,{t2:1}],
  ['ReZzii','Divine Corp',66,{t2:1}],
  ['Bippin','Divine Corp',66,{t2:1}],
  ['Bummy','Divine Corp',65,{t2:1}],
  ['Cloudy','Divine Corp',65,{t2:1}],
  ['Tango','Divine Corp',65,{t2:1}],
  ['rothermel','1HP',66,{t2:1}],
  ['Foresight','1HP',66,{t2:1}],
  ['Deity','1HP',66,{t2:1}],
  ['Kyred','1HP',65,{t2:1}],
  ['Lucki','1HP',65,{t2:1}],
  ['Brae','Karn & Co',65,{t2:1}],
  ['NickB2A','Nokturns',64,{t2:1}],
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
  ['d0mantas','Team Secret Academy',69,{t2:1}],
  ['Flexy','Team Secret Academy',69,{t2:1}],
  ['Melocy','Valid Unit',69,{t2:1}],
  ['Tyl','Valid Unit',69,{t2:1}],
  ['Rollojce','Valid Unit',68,{t2:1}],
  ['Fitzy','Valid Unit',68,{t2:1}],
  ['ProLikes','Valid Unit',68,{t2:1}],
  ['Vacuna','Valid Unit (reserva)',66,{t2:1}],
  ['REHTI','Entropy Gaming',68,{t2:1}],
  ['Duffers','Entropy Gaming',68,{t2:1}],
  ['Makzito','Entropy Gaming',67,{t2:1}],
  ['joosi','Entropy Gaming',67,{t2:1}],
  ['rexyze','Entropy Gaming',67,{t2:1}],
  ['Bal0uX','Soul\'s Heart EU',67,{t2:1}],
  ['Esteban','Soul\'s Heart EU',67,{t2:1}],
  ['Apak','Soul\'s Heart EU',66,{t2:1}],
  ['Fire','Soul\'s Heart EU',66,{t2:1}],
  ['BMS','Soul\'s Heart EU',66,{t2:1}],
  ['KrowX','WASP ESPORT',66,{t2:1}],
  ['kbrd','WASP ESPORT',66,{t2:1}],
  ['Alxreee','WASP ESPORT',65,{t2:1}],
  ['Yaxs','WASP ESPORT',65,{t2:1}],
  ['Glock','Honvéd',66,{t2:1}],
  ['Azzr','Honvéd',66,{t2:1}],
  ['Kendrew','Honvéd (reserva)',64,{t2:1}],
  ['Layton','Honvéd (reserva)',64,{t2:1}],
  ['Lowkyy','Owned eSport',65,{t2:1}],
  ['Mvv','Owned eSport',65,{t2:1}],
  ['tucanQ','Fans of Attics',65,{t2:1}],
  ['Oli','Fans of Attics',65,{t2:1}],
  ['RockNRollDJ','Good Intentions',66,{t2:1}],
  ['Crex','Good Intentions (reserva)',64,{t2:1}],
  ['Tazzy','Maestro Esca',65,{t2:1}],
  ['Shiinka','Maestro Esca',65,{t2:1}],
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
  ['ZOSHAV','Sharper Esports (reserva)',64,{t2:1}],
  ['xCerlotic','Sharper Esports (reserva)',64,{t2:1}],
  ['pakie','999 (reserva)',64,{t2:1}],
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
  ['fluxo','Fluxo W7M','W7M','SAL',91,'Paluh,Lobin,dotz,HATEZ,Fntzy',{tag:'W7M',color:'#ffb100',src:1,coach:'thug (analista: Dan)',note:'Elenco reformulado em 31/08'}],
  ['faze','FaZe Clan','FaZe','SAL',96,'Cyber,KDS,Handyy,Soulz1,Vitaking*',{tag:'FZ',color:'#ff3b3b',src:1,ewc:1}],
  ['liquid','Team Liquid Alienware','Liquid','SAL',89,'FelipoX,Kheyze,Maia,Jv92,nade',{tag:'TL',color:'#3aa0ff',src:1}],
  ['furia','FURIA','FURIA','SAL',91,'HerdsZ,DiasLucas,volpz,Loira,Bokzera',{tag:'FUR',color:'#e8e8e8',src:1}],
  ['loud','LOUD','LOUD','SAL',87,'live,Flastry,resetz,Stemp,Gabu',{tag:'LLL',color:'#35e08a'}],
  ['los','LOS','LOS','SAL',84,'Dash,peres,Nuxxga,Daffodil,Dodez',{tag:'LOS',color:'#ffd23f'}],
  ['l5','Lucky Five','L5','SAL',82,'Psycho,pino,Bassetto,Neskin,Wizard',{tag:'L5',color:'#7be07b'}],
  ['bd','Black Dragons','B. Dragons','SAL',80,'R4re,Romeo,Mr6otlaw,Swag,Guto',{tag:'BD',color:'#d94d4d'}],
  ['imp','Imperial Esports','Imperial','SAL',79,'xS3xyCake,NearZ,mitrix,Legacy,Hasaqui',{tag:'IMP',color:'#5aa7ff'}],
  ['intz','INTZ','INTZ','SAL',78,'Rappz,Ar7hr,naka,Stk,AngelzZ',{tag:'INT',color:'#4f7cff'}],
  // ---- NAL ----
  ['dz','DarkZero Esports','DarkZero','NAL',92,'Fultz,njr,J9O,Kyno,Nuers|Koshi',{tag:'DZ',color:'#ff5a1f',src:1,note:'Campeã de Major'}],
  ['wild','Wildcard Gaming','Wildcard','NAL',91,'Kanzen,Spiker,Bae,Adrian,bbySharKK',{tag:'WC',color:'#b06cff',src:1,note:'Campeã do Stage 1'}],
  ['m80','M80','M80','NAL',89,'Gunnar,Savage,Gaveni,Ashn,dfuzr',{tag:'M80',color:'#ff9d00',src:1,coach:'Fabian'}],
  ['shop','Shopify Rebellion','Shopify','NAL',87,'Canadian,Spoit,Rexen,Surf,Ambi',{tag:'SR',color:'#8fd14f'}],
  ['c9','Cloud9','Cloud9','NAL',87,'Monk,Panbazou,Eddy,Centir,EWZY',{tag:'C9',color:'#3ec3ff'}],
  ['100t','100 Thieves','100T','NAL',86,'Hotancold,GMZ,SpiriTz,Atom,Kason',{tag:'100',color:'#ff4d5e'}],
  ['ssg','Spacestation Gaming','SSG','NAL',85,'Dream,Gity,Rival,Aiden,Raid',{tag:'SSG',color:'#5aa7ff'}],
  ['outlast','Outlast','Outlast','NAL',81,'JoyStiCK,iconic,Trevmak,Tyrant,Mili',{tag:'OL',color:'#ffb347'}],
  ['ff','Five Fears','Five Fears','NAL',80,'Forrest,JJBlazt,Snake,FENZ,Riv4l',{tag:'5F',color:'#e0e0e0'}],
  ['fun','For Fun Esports','For Fun','NAL',79,'Beeno,Packer,MikeW,Vulspur,Serx',{tag:'FF',color:'#ffd166'}],
  // ---- EML ----
  ['falcons','Team Falcons','Falcons','EML',93,'BriD,Yuzus,jume,LikEfac,Solotov',{tag:'FLC',color:'#33d17a',src:1,note:'Campeões europeus'}],
  ['shifters','Shifters (ex-Team BDS)','Shifters','EML',93,'CTZN,Nafe,Freq,DEADSHT,Robby',{tag:'BDS',color:'#ff3fa4',src:1,ex:'Team BDS rebatizada em 15/12/2025'}],
  ['g2','G2 Esports','G2','EML',89,'Shaiiko,Doki,Benjamaster,Alem4o,Stompn',{tag:'G2',color:'#ff5c5c',src:1,star:'Shaiiko'}],
  ['vp','Virtus.pro','VP','EML',86,'dan,p4sh4,RORICK,SkyZs,Nayqo',{tag:'VP',color:'#ffb347'}],
  ['secret','Team Secret','Secret','EML',86,'Hungry,Noa,CroqSon,Creedz,Drillz',{tag:'TS',color:'#e5e5e5'}],
  ['fnatic','Fnatic','Fnatic','EML',85,'Deapek,Dante7,Wizard,DJ,Sm1ss',{tag:'FNC',color:'#ff8a1f'}],
  ['heretics','Team Heretics','Heretics','EML',84,'Aqui,Skeptic,Lollo,Lasmooo,MATZ|Zaaramy',{tag:'TH',color:'#c9a227'}],
  ['geekay','Geekay Esports','Geekay','EML',83,'Yoggah,AsK,Gruby,Eupor,Sarks',{tag:'GK',color:'#ffe135'}],
  ['tm','Twisted Minds','Twisted','EML',82,'BlaZ,Tr1ixd,Hashom,Mowwwgli,jlaDD',{tag:'TM',color:'#8ad0ff'}],
  ['rebels','Rebels Gaming','Rebels','EML',80,'Elemzje,Linkoo,Asa,Marteau,Feno|leadjay',{tag:'RBL',color:'#ff6b6b'}],
  // ---- CNL ----
  ['ag','All Gamers','AG','CNL',85,'Mcie,MoonL1ght,Ra3LGuN,SoloMiD,YaaaaZ',{tag:'AG',color:'#ff4d5e'}],
  ['edg','EDward Gaming','EDG','CNL',84,'Direction,OnJuly,Bapn,Carpe,Reif|Mo5quito',{tag:'EDG',color:'#e0e0e0'}],
  ['kz','KINGZERO eSports','KINGZERO','CNL',83,'MomoWiNGs,KzB,Fiber,Sunset,Wick',{tag:'KZ',color:'#ffd166'}],
  ['tyloo','TYLOO','TYLOO','CNL',82,'Jackywu,Songla,ABEI,AurK11,Austin',{tag:'TYL',color:'#ffd166'}],
  ['lev','Leviatán Esports','Leviatán','CNL',80,'Bullet1,SHADOW,Binbin,ArFeng,DEMoZ',{tag:'LEV',color:'#a06bff'}],
  ['fam','Four Angry Men','4AM','CNL',80,'rockstarKa,txonly,ShaZ5ibe,Asylum,Yoviker|Logan',{tag:'4AM',color:'#ff7a45'}],
  ['titan','Titan Esports Club','Titan','CNL',79,'A1mer,Rusher,Arcox,KINA1,bottomLove',{tag:'TTN',color:'#55e6c1'}],
  ['lgd','LGD Gaming','LGD','CNL',78,'J1ahao,KY,Pau1,wantto,MavDEMON',{tag:'LGD',color:'#4f7cff'}],
  ['coin','One Coin','One Coin','CNL',78,'BigJ,Darcly,SDGundam,Akira,History',{tag:'1C',color:'#ffb300'}],
  ['pozy','POZY','POZY','CNL',77,'NRea117,POPO,ZOZ,Su1,N9istr',{tag:'PZY',color:'#6fd3ff'}],
  // ---- APL Ásia ----
  ['wbg','Weibo Gaming','Weibo','APLA',84,'SpeakEasy,Gotti,Reeps96,Hovenherst,Terd',{tag:'WBG',color:'#ff7a45'}],
  ['elv','Elevate','Elevate','APLA',80,'TOLJI,Scatman,MrPuncH,Ape,Nhaiqal',{tag:'ELV',color:'#ffd23f'}],
  ['999','999','999','APLA',78,'JayDog,JyuB,Miku,Staxsta,Sowhat|Shiba',{tag:'999',color:'#e0e0e0'}],
  ['fury','FURY','FURY','APLA',77,'Roldinii,Darkk,Markelelele,LebyRinth,Kaneki',{tag:'FRY',color:'#ff4d5e'}],
  ['daystar','Daystar','Daystar','APLA',76,'Souffle,Pikan,Seal,AZuKi,Yao',{tag:'DAY',color:'#ffb347'}],
  ['dolph','Dolphins Esports','Dolphins','APLA',76,'ZISTZ,SUNSTRIKE,KI11ERz,TeNnO,Chattonounmei',{tag:'DOL',color:'#3aa0ff'}],
  ['sharper','Sharper Esports','Sharper','APLA',75,'Lycolis,Nay.Pew,BGMan,KritJ,Peeps',{tag:'SHP',color:'#7be07b'}],
  ['lo','leftovers','leftovers','APLA',74,'Jittery,xedux,Yannis,Edward,klz',{tag:'LFT',color:'#c48bff'}],
  // ---- APL Norte ----
  ['dplus','Dplus KIA','Dplus KIA','APLN',85,'Mity,ion,Levy,Faallz,yurivst',{tag:'DK',color:'#00d2ff'}],
  ['cag','CAG by VARREL','CAG','APLN',81,'Anitun,Chibisu,Zaka,DD,ShuReap',{tag:'CAG',color:'#ff9d00'}],
  ['trippy','TRIPPY','TRIPPY','APLN',79,'Demic,Harp3rXD,Arukaze,NL,DOCHI|munu74',{tag:'TRP',color:'#b06cff'}],
  ['scarz','SCARZ','SCARZ','APLN',78,'Rec,Wqsyo1,FishLike,Nina,YuKiz',{tag:'SZ',color:'#ff4d5e'}],
  ['fearx','FearX','FearX','APLN',78,'Soldier,Woogiman,JLT,Rider,EunSang',{tag:'FX',color:'#ffd166'}],
  ['rrx','RRX','RRX','APLN',77,'Akusu,maou,Yuyu,JiNm,KoroMomo',{tag:'RRX',color:'#e0e0e0'}],
  ['cybme','Can You Be My Enemy','CYBME','APLN',76,'Yanagi,AsveL,sikiNNGO,NOVASHATOL,Toki',{tag:'CYB',color:'#6fd3ff'}],
  ['kino','KINOTROPE gaming','KNT','APLN',75,'gatorada,Ayagator,Eclair,Aokayu,Kawa',{tag:'KNT',color:'#55e6c1'}],
  // ---- APL Oceania ----
  ['chiefs','Chiefs Esports Club','Chiefs','APLO',82,'Wettables,Neptune,Jakenna,Relaes,Lunchbox',{tag:'CHF',color:'#ff4d5e'}],
  ['ent','ENTERPRISE Esports','ENTERPRISE','APLO',81,'Jigsaw,Kyro,Tuhan,Brendo,Playxr',{tag:'ENT',color:'#ffd23f'}],
  ['7ven','7VEN','7VEN','APLO',79,'Presidnt,Pinku,Baele,Walsh,Tukk',{tag:'7VN',color:'#a06bff'}],
  ['man','Man eSports LFO','Man','APLO',77,'Huntr,Pluto,Sharkie,Elementz,Beers',{tag:'MAN',color:'#ff9d00'}],
  ['anios','Team Anios','Anios','APLO',76,'ChefJeff,erazer,Proxy,Machine,Acog',{tag:'ANI',color:'#3aa0ff'}],
  ['arcade','Arcade Esports','Arcade','APLO',75,'Japer,FZICS,Loyalth,Aserz,Syrro',{tag:'ARC',color:'#7be07b'}],
  ['shaiik','Shaiikademy','Shaiikademy','APLO',74,'KKin,Wizard,Shaz,Rhqnz,Kynvx',{tag:'SHA',color:'#ff7ad9'}],
  ['sphere','Circular Spheres','Spheres','APLO',73,'Kqrma,GOOOFT,Sword,Nezerati,Palarazi',{tag:'CS',color:'#6fe0d0'}]
];
