/**
 * National Benefit Alliance — Main JavaScript
 * nationalbenefitalliance.com
 */

/* ============================================================
   ZIP CODE → COUNTY LOOKUP (Florida)
   ============================================================ */

// Comprehensive Florida ZIP-to-County mapping
const FLORIDA_ZIP_COUNTY = {
  // alachua
  "32601":"alachua","32602":"alachua","32603":"alachua","32604":"alachua","32605":"alachua","32606":"alachua","32607":"alachua","32608":"alachua",
  "32609":"alachua","32610":"alachua","32611":"alachua","32612":"alachua","32614":"alachua","32615":"alachua","32616":"alachua","32618":"alachua",
  "32622":"alachua","32631":"alachua","32633":"alachua","32635":"alachua","32640":"alachua","32641":"alachua","32655":"alachua","32658":"alachua",
  "32662":"alachua","32666":"alachua","32694":"alachua",
  // baker
  "32040":"baker","32063":"baker","32087":"baker",
  // bay
  "32402":"bay","32403":"bay","32404":"bay","32405":"bay","32406":"bay","32407":"bay","32408":"bay","32409":"bay",
  "32410":"bay","32411":"bay","32412":"bay","32413":"bay","32417":"bay","32419":"bay","32422":"bay","32433":"bay",
  "32434":"bay","32435":"bay","32436":"bay","32437":"bay","32447":"bay","32460":"bay","32466":"bay",
  // bradford
  "32042":"bradford","32044":"bradford","32058":"bradford","32091":"bradford",
  // brevard
  "32901":"brevard","32902":"brevard","32903":"brevard","32904":"brevard","32905":"brevard","32906":"brevard","32907":"brevard","32908":"brevard",
  "32909":"brevard","32910":"brevard","32911":"brevard","32912":"brevard","32919":"brevard","32920":"brevard","32922":"brevard","32923":"brevard",
  "32924":"brevard","32925":"brevard","32926":"brevard","32927":"brevard","32931":"brevard","32932":"brevard","32934":"brevard","32935":"brevard",
  "32936":"brevard","32937":"brevard","32940":"brevard","32941":"brevard","32949":"brevard","32950":"brevard","32951":"brevard","32952":"brevard",
  "32953":"brevard","32954":"brevard","32955":"brevard","32956":"brevard","32957":"brevard","32958":"brevard","32959":"brevard","32976":"brevard",
  // broward
  "33004":"broward","33009":"broward","33019":"broward","33020":"broward","33021":"broward","33022":"broward","33023":"broward","33024":"broward",
  "33025":"broward","33026":"broward","33027":"broward","33028":"broward","33029":"broward","33060":"broward","33062":"broward","33063":"broward",
  "33064":"broward","33065":"broward","33066":"broward","33067":"broward","33068":"broward","33069":"broward","33071":"broward","33072":"broward",
  "33073":"broward","33076":"broward","33301":"broward","33304":"broward","33305":"broward","33306":"broward","33308":"broward","33309":"broward",
  "33310":"broward","33311":"broward","33312":"broward","33313":"broward","33314":"broward","33315":"broward","33316":"broward","33317":"broward",
  "33319":"broward","33321":"broward","33322":"broward","33323":"broward","33324":"broward","33325":"broward","33326":"broward","33327":"broward",
  "33328":"broward","33329":"broward","33330":"broward","33331":"broward","33332":"broward","33334":"broward","33388":"broward","33441":"broward",
  "33442":"broward","33443":"broward",
  // calhoun
  "32421":"calhoun","32423":"calhoun","32424":"calhoun","32432":"calhoun","32449":"calhoun",
  // charlotte
  "33944":"charlotte","33946":"charlotte","33947":"charlotte","33948":"charlotte","33950":"charlotte","33951":"charlotte","33952":"charlotte","33953":"charlotte",
  "33954":"charlotte","33955":"charlotte","33980":"charlotte","33981":"charlotte","33982":"charlotte","33983":"charlotte",
  // citrus
  "34423":"citrus","34428":"citrus","34429":"citrus","34433":"citrus","34434":"citrus","34436":"citrus","34441":"citrus","34442":"citrus",
  "34445":"citrus","34446":"citrus","34447":"citrus","34448":"citrus","34450":"citrus","34451":"citrus","34452":"citrus","34453":"citrus",
  "34461":"citrus","34465":"citrus",
  // clay
  "32003":"clay","32006":"clay","32008":"clay","32030":"clay","32043":"clay","32050":"clay","32056":"clay","32065":"clay",
  "32067":"clay","32068":"clay","32073":"clay","32079":"clay","32099":"clay",
  // collier
  "34101":"collier","34102":"collier","34103":"collier","34104":"collier","34105":"collier","34106":"collier","34107":"collier","34108":"collier",
  "34109":"collier","34110":"collier","34112":"collier","34113":"collier","34114":"collier","34116":"collier","34117":"collier","34119":"collier",
  "34120":"collier","34135":"collier","34136":"collier","34137":"collier","34138":"collier","34139":"collier","34140":"collier","34141":"collier",
  "34142":"collier","34143":"collier","34145":"collier","34146":"collier",
  // columbia
  "32024":"columbia","32025":"columbia","32038":"columbia","32055":"columbia","32061":"columbia","32071":"columbia",
  // desoto
  "34266":"desoto","34267":"desoto","34268":"desoto","34269":"desoto",
  // dixie
  "32628":"dixie","32648":"dixie","32680":"dixie",
  // duval
  "32201":"duval","32202":"duval","32203":"duval","32204":"duval","32205":"duval","32206":"duval","32207":"duval","32208":"duval",
  "32209":"duval","32210":"duval","32211":"duval","32212":"duval","32214":"duval","32216":"duval","32217":"duval","32218":"duval",
  "32219":"duval","32220":"duval","32221":"duval","32222":"duval","32223":"duval","32224":"duval","32225":"duval","32226":"duval",
  "32227":"duval","32228":"duval","32229":"duval","32231":"duval","32232":"duval","32233":"duval","32234":"duval","32235":"duval",
  "32236":"duval","32237":"duval","32238":"duval","32239":"duval","32240":"duval","32241":"duval","32244":"duval","32245":"duval",
  "32246":"duval","32247":"duval","32250":"duval","32254":"duval","32255":"duval","32256":"duval","32257":"duval","32258":"duval",
  "32259":"duval","32266":"duval","32277":"duval",
  // escambia
  "32501":"escambia","32502":"escambia","32503":"escambia","32504":"escambia","32505":"escambia","32506":"escambia","32507":"escambia","32508":"escambia",
  "32509":"escambia","32511":"escambia","32512":"escambia","32513":"escambia","32514":"escambia","32516":"escambia","32520":"escambia","32522":"escambia",
  "32523":"escambia","32524":"escambia","32526":"escambia","32535":"escambia","32539":"escambia","32560":"escambia","32565":"escambia",
  // flagler
  "32110":"flagler","32136":"flagler","32137":"flagler","32138":"flagler","32164":"flagler",
  // franklin
  "32320":"franklin","32322":"franklin","32328":"franklin","32329":"franklin",
  // gadsden
  "32324":"gadsden","32332":"gadsden","32333":"gadsden","32343":"gadsden","32349":"gadsden","32351":"gadsden","32352":"gadsden","32353":"gadsden",
  // gilchrist
  "32619":"gilchrist","32643":"gilchrist","32693":"gilchrist",
  // glades
  "33471":"glades",
  // gulf
  "32401":"gulf","32456":"gulf","32457":"gulf","32465":"gulf","32468":"gulf",
  // hamilton
  "32052":"hamilton","32053":"hamilton","32096":"hamilton",
  // hardee
  "33834":"hardee","33865":"hardee","33873":"hardee",
  // hendry
  "33440":"hendry","33935":"hendry",
  // hernando
  "34601":"hernando","34602":"hernando","34603":"hernando","34604":"hernando","34605":"hernando","34606":"hernando","34607":"hernando","34608":"hernando",
  "34609":"hernando","34610":"hernando","34611":"hernando","34613":"hernando","34614":"hernando",
  // highlands
  "33825":"highlands","33852":"highlands","33857":"highlands","33860":"highlands","33862":"highlands","33870":"highlands","33871":"highlands","33872":"highlands",
  "33875":"highlands","33876":"highlands",
  // hillsborough
  "33510":"hillsborough","33511":"hillsborough","33527":"hillsborough","33534":"hillsborough","33547":"hillsborough","33548":"hillsborough","33563":"hillsborough","33565":"hillsborough",
  "33566":"hillsborough","33567":"hillsborough","33568":"hillsborough","33569":"hillsborough","33570":"hillsborough","33571":"hillsborough","33572":"hillsborough","33573":"hillsborough",
  "33574":"hillsborough","33578":"hillsborough","33579":"hillsborough","33583":"hillsborough","33584":"hillsborough","33586":"hillsborough","33587":"hillsborough","33592":"hillsborough",
  "33594":"hillsborough","33595":"hillsborough","33596":"hillsborough","33601":"hillsborough","33602":"hillsborough","33603":"hillsborough","33604":"hillsborough","33605":"hillsborough",
  "33606":"hillsborough","33607":"hillsborough","33608":"hillsborough","33609":"hillsborough","33610":"hillsborough","33611":"hillsborough","33612":"hillsborough","33613":"hillsborough",
  "33614":"hillsborough","33615":"hillsborough","33616":"hillsborough","33617":"hillsborough","33618":"hillsborough","33619":"hillsborough","33620":"hillsborough","33621":"hillsborough",
  "33624":"hillsborough","33625":"hillsborough","33626":"hillsborough","33629":"hillsborough","33634":"hillsborough","33635":"hillsborough","33637":"hillsborough","33647":"hillsborough",
  // holmes
  "32425":"holmes","32430":"holmes","32464":"holmes",
  // indian-river
  "32948":"indian-river","32960":"indian-river","32961":"indian-river","32962":"indian-river","32963":"indian-river","32964":"indian-river","32965":"indian-river","32966":"indian-river",
  "32967":"indian-river","32968":"indian-river","32970":"indian-river","32971":"indian-river","32978":"indian-river",
  // jackson
  "32420":"jackson","32426":"jackson","32431":"jackson","32440":"jackson","32442":"jackson","32443":"jackson","32444":"jackson","32445":"jackson",
  "32446":"jackson","32448":"jackson",
  // jefferson
  "32336":"jefferson","32337":"jefferson","32340":"jefferson","32344":"jefferson",
  // lafayette
  "32013":"lafayette","32066":"lafayette",
  // lake
  "32702":"lake","32726":"lake","32735":"lake","32736":"lake","32757":"lake","32767":"lake","32776":"lake","32778":"lake",
  "32784":"lake","34711":"lake","34712":"lake","34713":"lake","34714":"lake","34715":"lake","34731":"lake","34736":"lake",
  "34737":"lake","34748":"lake","34749":"lake","34753":"lake","34755":"lake","34756":"lake","34762":"lake","34788":"lake",
  "34789":"lake","34797":"lake",
  // lee
  "33901":"lee","33902":"lee","33903":"lee","33904":"lee","33905":"lee","33906":"lee","33907":"lee","33908":"lee",
  "33909":"lee","33910":"lee","33912":"lee","33913":"lee","33914":"lee","33915":"lee","33916":"lee","33917":"lee",
  "33919":"lee","33920":"lee","33921":"lee","33922":"lee","33924":"lee","33928":"lee","33931":"lee","33932":"lee",
  "33936":"lee","33945":"lee","33956":"lee","33957":"lee","33960":"lee","33965":"lee","33966":"lee","33967":"lee",
  "33971":"lee","33972":"lee","33973":"lee","33974":"lee","33976":"lee","33990":"lee","33991":"lee","33993":"lee",
  "33994":"lee",
  // leon
  "32301":"leon","32302":"leon","32303":"leon","32304":"leon","32305":"leon","32306":"leon","32307":"leon","32308":"leon",
  "32309":"leon","32310":"leon","32311":"leon","32312":"leon","32313":"leon","32314":"leon","32315":"leon","32316":"leon",
  "32317":"leon","32318":"leon","32395":"leon","32399":"leon",
  // levy
  "32621":"levy","32625":"levy","32626":"levy","32627":"levy","32634":"levy","32639":"levy","32668":"levy","32669":"levy",
  "32696":"levy","34449":"levy","34498":"levy",
  // liberty
  "32321":"liberty","32334":"liberty",
  // madison
  "32059":"madison","32341":"madison","32350":"madison",
  // manatee
  "34201":"manatee","34202":"manatee","34203":"manatee","34204":"manatee","34205":"manatee","34206":"manatee","34207":"manatee","34208":"manatee",
  "34209":"manatee","34210":"manatee","34211":"manatee","34212":"manatee","34220":"manatee","34221":"manatee","34222":"manatee","34243":"manatee",
  "34251":"manatee",
  // marion
  "32102":"marion","32113":"marion","32134":"marion","32179":"marion","32195":"marion","32617":"marion","32664":"marion","32667":"marion",
  "32686":"marion","34420":"marion","34430":"marion","34431":"marion","34432":"marion","34470":"marion","34471":"marion","34472":"marion",
  "34473":"marion","34474":"marion","34475":"marion","34476":"marion","34477":"marion","34478":"marion","34479":"marion","34480":"marion",
  "34481":"marion","34482":"marion","34483":"marion","34488":"marion","34489":"marion","34492":"marion",
  // martin
  "33455":"martin","34956":"martin","34957":"martin","34990":"martin","34991":"martin","34992":"martin","34994":"martin","34995":"martin",
  "34996":"martin","34997":"martin",
  // miami-dade
  "33101":"miami-dade","33102":"miami-dade","33107":"miami-dade","33109":"miami-dade","33110":"miami-dade","33111":"miami-dade","33112":"miami-dade","33114":"miami-dade",
  "33116":"miami-dade","33119":"miami-dade","33121":"miami-dade","33122":"miami-dade","33124":"miami-dade","33125":"miami-dade","33126":"miami-dade","33127":"miami-dade",
  "33128":"miami-dade","33129":"miami-dade","33130":"miami-dade","33131":"miami-dade","33132":"miami-dade","33133":"miami-dade","33134":"miami-dade","33135":"miami-dade",
  "33136":"miami-dade","33137":"miami-dade","33138":"miami-dade","33139":"miami-dade","33140":"miami-dade","33141":"miami-dade","33142":"miami-dade","33143":"miami-dade",
  "33144":"miami-dade","33145":"miami-dade","33146":"miami-dade","33147":"miami-dade","33149":"miami-dade","33150":"miami-dade","33154":"miami-dade","33155":"miami-dade",
  "33156":"miami-dade","33157":"miami-dade","33158":"miami-dade","33160":"miami-dade","33161":"miami-dade","33162":"miami-dade","33163":"miami-dade","33165":"miami-dade",
  "33166":"miami-dade","33167":"miami-dade","33168":"miami-dade","33169":"miami-dade","33170":"miami-dade","33172":"miami-dade","33173":"miami-dade","33174":"miami-dade",
  "33175":"miami-dade","33176":"miami-dade","33177":"miami-dade","33178":"miami-dade","33179":"miami-dade","33180":"miami-dade","33181":"miami-dade","33182":"miami-dade",
  "33183":"miami-dade","33184":"miami-dade","33185":"miami-dade","33186":"miami-dade","33187":"miami-dade","33189":"miami-dade","33190":"miami-dade","33193":"miami-dade",
  "33194":"miami-dade","33196":"miami-dade","33197":"miami-dade","33199":"miami-dade",
  // monroe
  "33001":"monroe","33036":"monroe","33037":"monroe","33040":"monroe","33041":"monroe","33042":"monroe","33043":"monroe","33044":"monroe",
  "33045":"monroe","33050":"monroe","33051":"monroe","33052":"monroe","33070":"monroe",
  // nassau
  "32009":"nassau","32011":"nassau","32034":"nassau","32035":"nassau","32041":"nassau","32046":"nassau","32097":"nassau",
  // okaloosa
  "32531":"okaloosa","32532":"okaloosa","32536":"okaloosa","32537":"okaloosa","32538":"okaloosa","32540":"okaloosa","32541":"okaloosa","32542":"okaloosa",
  "32544":"okaloosa","32547":"okaloosa","32548":"okaloosa","32549":"okaloosa","32559":"okaloosa","32564":"okaloosa","32567":"okaloosa","32579":"okaloosa",
  "32580":"okaloosa",
  // okeechobee
  "34972":"okeechobee","34973":"okeechobee","34974":"okeechobee",
  // orange
  "32801":"orange","32802":"orange","32803":"orange","32804":"orange","32805":"orange","32806":"orange","32807":"orange","32808":"orange",
  "32809":"orange","32810":"orange","32811":"orange","32812":"orange","32814":"orange","32815":"orange","32816":"orange","32817":"orange",
  "32818":"orange","32819":"orange","32820":"orange","32821":"orange","32822":"orange","32824":"orange","32825":"orange","32826":"orange",
  "32827":"orange","32828":"orange","32829":"orange","32830":"orange","32831":"orange","32832":"orange","32833":"orange","32834":"orange",
  "32835":"orange","32836":"orange","32837":"orange","32839":"orange","34734":"orange","34760":"orange","34761":"orange","34777":"orange",
  "34778":"orange",
  // osceola
  "34739":"osceola","34741":"osceola","34742":"osceola","34743":"osceola","34744":"osceola","34745":"osceola","34746":"osceola","34747":"osceola",
  "34758":"osceola","34759":"osceola","34769":"osceola","34770":"osceola","34771":"osceola","34772":"osceola","34773":"osceola",
  // palm-beach
  "33401":"palm-beach","33402":"palm-beach","33403":"palm-beach","33404":"palm-beach","33405":"palm-beach","33406":"palm-beach","33407":"palm-beach","33408":"palm-beach",
  "33409":"palm-beach","33410":"palm-beach","33411":"palm-beach","33412":"palm-beach","33413":"palm-beach","33414":"palm-beach","33415":"palm-beach","33416":"palm-beach",
  "33417":"palm-beach","33418":"palm-beach","33419":"palm-beach","33420":"palm-beach","33421":"palm-beach","33422":"palm-beach","33424":"palm-beach","33425":"palm-beach",
  "33426":"palm-beach","33427":"palm-beach","33428":"palm-beach","33430":"palm-beach","33431":"palm-beach","33432":"palm-beach","33433":"palm-beach","33434":"palm-beach",
  "33435":"palm-beach","33436":"palm-beach","33437":"palm-beach","33438":"palm-beach","33444":"palm-beach","33445":"palm-beach","33446":"palm-beach","33447":"palm-beach",
  "33448":"palm-beach","33449":"palm-beach","33450":"palm-beach","33451":"palm-beach","33452":"palm-beach","33454":"palm-beach","33458":"palm-beach","33460":"palm-beach",
  "33461":"palm-beach","33462":"palm-beach","33463":"palm-beach","33464":"palm-beach","33465":"palm-beach","33466":"palm-beach","33467":"palm-beach","33468":"palm-beach",
  "33469":"palm-beach","33470":"palm-beach","33472":"palm-beach","33473":"palm-beach","33474":"palm-beach","33476":"palm-beach","33477":"palm-beach","33478":"palm-beach",
  "33480":"palm-beach","33481":"palm-beach","33482":"palm-beach","33483":"palm-beach","33484":"palm-beach","33486":"palm-beach","33487":"palm-beach","33488":"palm-beach",
  "33493":"palm-beach","33496":"palm-beach","33497":"palm-beach","33498":"palm-beach","33499":"palm-beach",
  // pasco
  "33523":"pasco","33524":"pasco","33525":"pasco","33526":"pasco","33537":"pasco","33539":"pasco","33540":"pasco","33541":"pasco",
  "33542":"pasco","33543":"pasco","33544":"pasco","33545":"pasco","33546":"pasco","33549":"pasco","33556":"pasco","33558":"pasco",
  "33559":"pasco","33576":"pasco","34637":"pasco","34638":"pasco","34639":"pasco","34652":"pasco","34653":"pasco","34654":"pasco",
  "34655":"pasco","34656":"pasco","34667":"pasco","34668":"pasco","34669":"pasco","34690":"pasco","34691":"pasco",
  // pinellas
  "33701":"pinellas","33702":"pinellas","33703":"pinellas","33704":"pinellas","33705":"pinellas","33706":"pinellas","33707":"pinellas","33708":"pinellas",
  "33709":"pinellas","33710":"pinellas","33711":"pinellas","33712":"pinellas","33713":"pinellas","33714":"pinellas","33715":"pinellas","33716":"pinellas",
  "33730":"pinellas","33755":"pinellas","33756":"pinellas","33759":"pinellas","33760":"pinellas","33761":"pinellas","33762":"pinellas","33763":"pinellas",
  "33764":"pinellas","33765":"pinellas","33766":"pinellas","33767":"pinellas","33770":"pinellas","33771":"pinellas","33772":"pinellas","33773":"pinellas",
  "33774":"pinellas","33775":"pinellas","33776":"pinellas","33777":"pinellas","33778":"pinellas","33779":"pinellas","33780":"pinellas","33781":"pinellas",
  "33782":"pinellas","33785":"pinellas","33786":"pinellas",
  // polk
  "33801":"polk","33802":"polk","33803":"polk","33804":"polk","33805":"polk","33806":"polk","33807":"polk","33809":"polk",
  "33810":"polk","33811":"polk","33812":"polk","33813":"polk","33815":"polk","33823":"polk","33827":"polk","33830":"polk",
  "33831":"polk","33835":"polk","33836":"polk","33837":"polk","33838":"polk","33839":"polk","33840":"polk","33841":"polk",
  "33843":"polk","33844":"polk","33845":"polk","33846":"polk","33847":"polk","33848":"polk","33849":"polk","33850":"polk",
  "33851":"polk","33853":"polk","33855":"polk","33856":"polk","33859":"polk","33863":"polk","33868":"polk","33877":"polk",
  "33880":"polk","33881":"polk","33882":"polk","33883":"polk","33884":"polk","33885":"polk","33888":"polk",
  // putnam
  "32112":"putnam","32131":"putnam","32140":"putnam","32148":"putnam","32177":"putnam","32178":"putnam","32181":"putnam","32187":"putnam",
  "32189":"putnam","32193":"putnam",
  // santa-rosa
  "32530":"santa-rosa","32533":"santa-rosa","32534":"santa-rosa","32561":"santa-rosa","32563":"santa-rosa","32566":"santa-rosa","32568":"santa-rosa","32569":"santa-rosa",
  "32570":"santa-rosa","32571":"santa-rosa","32572":"santa-rosa","32577":"santa-rosa","32583":"santa-rosa",
  // sarasota
  "34223":"sarasota","34228":"sarasota","34229":"sarasota","34230":"sarasota","34231":"sarasota","34232":"sarasota","34233":"sarasota","34234":"sarasota",
  "34235":"sarasota","34236":"sarasota","34237":"sarasota","34238":"sarasota","34239":"sarasota","34240":"sarasota","34241":"sarasota","34242":"sarasota",
  "34260":"sarasota","34264":"sarasota","34270":"sarasota","34272":"sarasota","34274":"sarasota","34275":"sarasota","34276":"sarasota","34277":"sarasota",
  "34278":"sarasota","34280":"sarasota","34281":"sarasota","34282":"sarasota","34284":"sarasota","34285":"sarasota","34286":"sarasota","34287":"sarasota",
  "34288":"sarasota","34289":"sarasota","34290":"sarasota","34291":"sarasota","34292":"sarasota","34293":"sarasota","34295":"sarasota",
  // seminole
  "32701":"seminole","32703":"seminole","32707":"seminole","32708":"seminole","32714":"seminole","32730":"seminole","32732":"seminole","32746":"seminole",
  "32750":"seminole","32751":"seminole","32752":"seminole","32762":"seminole","32766":"seminole","32771":"seminole","32772":"seminole","32773":"seminole",
  "32779":"seminole","32792":"seminole",
  // st-johns
  "32033":"st-johns","32080":"st-johns","32081":"st-johns","32082":"st-johns","32084":"st-johns","32085":"st-johns","32086":"st-johns","32092":"st-johns",
  "32095":"st-johns","32145":"st-johns",
  // st-lucie
  "34945":"st-lucie","34946":"st-lucie","34947":"st-lucie","34948":"st-lucie","34949":"st-lucie","34950":"st-lucie","34951":"st-lucie","34952":"st-lucie",
  "34953":"st-lucie","34954":"st-lucie","34958":"st-lucie","34981":"st-lucie","34982":"st-lucie","34983":"st-lucie","34984":"st-lucie","34985":"st-lucie",
  "34986":"st-lucie","34987":"st-lucie","34988":"st-lucie",
  // sumter
  "33513":"sumter","33514":"sumter","33521":"sumter","33538":"sumter","33585":"sumter","33597":"sumter","34484":"sumter","34491":"sumter",
  "34785":"sumter",
  // suwannee
  "32060":"suwannee","32062":"suwannee","32064":"suwannee",
  // taylor
  "32347":"taylor","32348":"taylor","32356":"taylor","32359":"taylor",
  // union
  "32054":"union","32083":"union",
  // volusia
  "32114":"volusia","32117":"volusia","32118":"volusia","32119":"volusia","32120":"volusia","32121":"volusia","32122":"volusia","32123":"volusia",
  "32124":"volusia","32125":"volusia","32126":"volusia","32127":"volusia","32128":"volusia","32129":"volusia","32130":"volusia","32132":"volusia",
  "32141":"volusia","32168":"volusia","32169":"volusia","32170":"volusia","32173":"volusia","32174":"volusia","32175":"volusia","32176":"volusia",
  "32180":"volusia","32190":"volusia","32198":"volusia","32713":"volusia","32720":"volusia","32721":"volusia","32722":"volusia","32723":"volusia",
  "32724":"volusia","32725":"volusia","32727":"volusia","32728":"volusia","32738":"volusia","32744":"volusia","32759":"volusia","32763":"volusia",
  "32764":"volusia","32774":"volusia","32775":"volusia","32781":"volusia","32783":"volusia",
  // wakulla
  "32327":"wakulla","32346":"wakulla","32355":"wakulla","32358":"wakulla",
  // walton
  "32439":"walton","32455":"walton","32459":"walton","32461":"walton","32550":"walton","32578":"walton","32588":"walton",
  // washington
  "32427":"washington","32428":"washington","32438":"washington","32462":"washington",
};

const COUNTY_NAMES = {
  "miami-dade": "Miami-Dade County",
  "broward": "Broward County",
  "palm-beach": "Palm Beach County",
  "orange": "Orange County",
  "hillsborough": "Hillsborough County",
  "pinellas": "Pinellas County",
  "duval": "Duval County",
  "lee": "Lee County",
  "polk": "Polk County",
  "brevard": "Brevard County",
  "volusia": "Volusia County",
  "seminole": "Seminole County",
  "pasco": "Pasco County",
  "manatee": "Manatee County",
  "sarasota": "Sarasota County",
  "collier": "Collier County",
  "st-lucie": "St. Lucie County",
  "marion": "Marion County",
  "alachua": "Alachua County",
  "escambia": "Escambia County",
  "leon": "Leon County",
};

/**
 * Look up a Florida county by ZIP code
 */
function lookupZip(zip) {
  const clean = zip.replace(/\D/g, '').slice(0, 5);
  return FLORIDA_ZIP_COUNTY[clean] || null;
}

/**
 * Handle ZIP form submission
 */
function handleZipSubmit(e) {
  e && e.preventDefault();
  const input = document.getElementById('zip-input');
  if (!input) return;
  const zip = input.value.trim();

  if (!/^\d{5}$/.test(zip)) {
    showZipError('Please enter a valid 5-digit ZIP code.');
    return;
  }

  const county = lookupZip(zip);
  if (county) {
    // For prototype: redirect to county page
    window.location.href = `/florida/${county}/`;
  } else {
    // ZIP not found — could be other state or unrecognized
    showZipError('ZIP code not found in our Florida database. <a href="/florida/">Browse all Florida counties →</a>');
  }
}

function showZipError(msg) {
  let err = document.getElementById('zip-error');
  if (!err) {
    err = document.createElement('p');
    err.id = 'zip-error';
    err.style.cssText = 'color:#DC3545;font-size:0.85rem;margin-top:0.5rem;';
    const group = document.querySelector('.zip-input-group');
    if (group) group.parentNode.insertBefore(err, group.nextSibling);
  }
  err.innerHTML = msg;
  setTimeout(() => { if (err) err.innerHTML = ''; }, 5000);
}

/* ---- ZIP input: numbers only, max 5 digits ---- */
document.addEventListener('DOMContentLoaded', () => {
  const zipInput = document.getElementById('zip-input');
  if (zipInput) {
    zipInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 5);
    });
    zipInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleZipSubmit(e);
    });
  }

  // Bind form submit
  const zipForm = document.getElementById('zip-form');
  if (zipForm) zipForm.addEventListener('submit', handleZipSubmit);

  // Mobile nav toggle
  const hamburger = document.querySelector('.nav__hamburger');
  const navLinks = document.querySelector('.nav__links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '70px'; navLinks.style.left = '0'; navLinks.style.right = '0';
      navLinks.style.background = '#fff'; navLinks.style.padding = '1rem';
      navLinks.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    });
  }

  // Animate elements on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(el => {
      if (el.isIntersecting) {
        el.target.style.opacity = '1';
        el.target.style.transform = 'translateY(0)';
        observer.unobserve(el.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step, .category-card, .county-highlight').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});

/* ============================================================
   ACCESS CODE VALIDATION
   ============================================================ */
function validateAccessCode(code) {
  // In production: API call to backend
  // For prototype: simple format check (6 alphanumeric chars)
  return /^[A-Z0-9]{6,8}$/.test(code.toUpperCase());
}

function handleAccessSubmit(e) {
  e && e.preventDefault();
  const input = document.getElementById('access-code-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();

  if (validateAccessCode(code)) {
    // In production: POST to /api/verify-code
    document.getElementById('access-gate').style.display = 'none';
    document.getElementById('resources-content').style.display = 'block';
    sessionStorage.setItem('nba_access_code', code);
    sessionStorage.setItem('nba_access_time', Date.now());
  } else {
    const err = document.getElementById('code-error');
    if (err) err.textContent = 'Invalid code. Please call our office at 1-800-NBA-HELP to get your access code.';
  }
}

// Check if user already has valid session access
window.addEventListener('DOMContentLoaded', () => {
  const code = sessionStorage.getItem('nba_access_code');
  const time = sessionStorage.getItem('nba_access_time');
  if (code && time && (Date.now() - parseInt(time)) < 3600000) { // 1 hour
    const gate = document.getElementById('access-gate');
    const content = document.getElementById('resources-content');
    if (gate && content) { gate.style.display = 'none'; content.style.display = 'block'; }
  }

  const accessForm = document.getElementById('access-form');
  if (accessForm) accessForm.addEventListener('submit', handleAccessSubmit);

  // Access code input: uppercase
  const codeInput = document.getElementById('access-code-input');
  if (codeInput) {
    codeInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    });
  }
});

/* ============================================================
   COUNTY PAGE: DOWNLOAD / EMAIL PDF
   ============================================================ */
function requestPdfEmail(county, state, email) {
  // In production: POST to /api/send-pdf
  fetch('/api/send-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ county, state, email })
  }).then(r => r.json()).then(data => {
    if (data.success) {
      alert(`Resource guide sent to ${email}! Check your inbox.`);
    }
  }).catch(() => {
    alert('Email queued. You will receive your resource guide shortly.');
  });
}

/* ============================================================
   COUNTER ANIMATION (for stats)
   ============================================================ */
function animateCounter(el, target, duration = 1500) {
  const start = 0;
  const startTime = performance.now();
  const isFloat = target % 1 !== 0;
  const suffix = el.dataset.suffix || '';

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = (isFloat ? current.toFixed(1) : Math.floor(current)).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Initialize counters when visible
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));
});

/* ============================================================
   COUNTY GUIDE ACCESS GATE
   ============================================================ */
(function () {
  // Only run on county guide pages (path contains /florida/)
  if (!window.location.pathname.includes('/florida/')) return;

  const ACCESS_KEY = 'nba_county_access';
  const VALID_CODE = '090909';

  // Already unlocked this session
  if (sessionStorage.getItem(ACCESS_KEY) === 'granted') return;

  // Build overlay
  const overlay = document.createElement('div');
  overlay.id = 'nba-access-gate';
  overlay.innerHTML = `
    <div id="nba-gate-box">
      <img src="/images/nba-logo.png" alt="National Benefit Alliance" id="nba-gate-logo" onerror="this.style.display='none'">
      <h2>County Resource Guide</h2>
      <p>Enter your access code to view the full county guide.</p>
      <input type="password" id="nba-gate-input" placeholder="Access code" maxlength="20" autocomplete="off" />
      <button id="nba-gate-btn">Unlock Guide</button>
      <p id="nba-gate-error" style="display:none;">Incorrect code. Please try again.</p>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #nba-access-gate {
      position: fixed; inset: 0; z-index: 99999;
      background: rgba(10, 30, 60, 0.92);
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #nba-gate-box {
      background: #fff; border-radius: 12px; padding: 40px 36px;
      max-width: 380px; width: 90%; text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    #nba-gate-logo { max-width: 160px; margin-bottom: 16px; }
    #nba-gate-box h2 { margin: 0 0 8px; color: #0a1e3c; font-size: 1.4rem; }
    #nba-gate-box p { color: #555; font-size: 0.95rem; margin: 0 0 20px; }
    #nba-gate-input {
      width: 100%; padding: 12px 14px; font-size: 1.1rem; letter-spacing: 4px;
      border: 2px solid #ddd; border-radius: 8px; text-align: center;
      box-sizing: border-box; margin-bottom: 14px; outline: none;
      transition: border-color 0.2s;
    }
    #nba-gate-input:focus { border-color: #0a5c9e; }
    #nba-gate-btn {
      width: 100%; padding: 12px; background: #0a5c9e; color: #fff;
      border: none; border-radius: 8px; font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    #nba-gate-btn:hover { background: #0845780; }
    #nba-gate-error { color: #c0392b; font-size: 0.88rem; margin: 10px 0 0; }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  function attemptUnlock() {
    const val = document.getElementById('nba-gate-input').value.trim();
    if (val === VALID_CODE) {
      sessionStorage.setItem(ACCESS_KEY, 'granted');
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s';
      setTimeout(() => overlay.remove(), 300);
    } else {
      const err = document.getElementById('nba-gate-error');
      const inp = document.getElementById('nba-gate-input');
      err.style.display = 'block';
      inp.value = '';
      inp.focus();
      inp.style.borderColor = '#c0392b';
      setTimeout(() => { inp.style.borderColor = '#ddd'; }, 1200);
    }
  }

  document.getElementById('nba-gate-btn').addEventListener('click', attemptUnlock);
  document.getElementById('nba-gate-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptUnlock();
  });

  // Focus input after render
  setTimeout(() => document.getElementById('nba-gate-input')?.focus(), 100);
})();
