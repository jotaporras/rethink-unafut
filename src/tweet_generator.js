var genericTweet = [
	["Esta noche gana ","!!!!","juan_vainas"],
	["Ole ole ola ","!!!! Y cada dia te quiero mas","rey_pate8"],
	["Viva  ","","medford"],
	["Amarte? ni que fueras "," !","fanatico_a_muerte"],
	["Que Dios tenga a  "," en su santa gloria","cristian_lagos9"],
];


function generateRandomTweet(){
	var tweetStructure = pickGenericTweet();
	var team = pickTeam();
	return {
		user: tweetStructure[2],
		text: tweetStructure[0] + "#" + team + " " + tweetStructure[1]
	};
}

function pickTeam(){
	var rand = Math.floor(Math.random()*100);
	 switch(true){
		case rand>=0 && rand<40: return "saprissa";
		case rand>=40 && rand<70: return "lda";
		case rand>=70 && rand<85: return "heredia";
		case rand>=85 && rand<95: return "cartago";
		case rand>=95 && rand<98: return "perez";
		case rand>=98 && rand<100: return "brujas";
		default: return "Messi";
	}
}


function pickGenericTweet() {
	var i = Math.floor(Math.random()*genericTweet.length);
	return genericTweet[i]
}