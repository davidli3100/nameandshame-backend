import * as request from "request-promise-native";

let sourced: boolean = false;
let wordslist: Set<string> = new Set<string>()




function sourceWordsList(){
    let url = 'https://raw.githubusercontent.com/RobertJGabriel/Google-profanity-words/master/list.txt';
    (async () => {
        
        var options = {
            uri: url
        };
      
        const result = await request.get(options);
        var tokens = result.split("\n");
        for(var i  = 0; i < tokens.length; i++){
            wordslist.add(tokens[i].trim().toLowerCase());
        }

      })()

     


}


function addWord(s: string): void {
    wordslist.add(s.toLowerCase());
}


function isLetter(s: string): boolean {
    return (s.length === 1 && (s.toLowerCase() != s.toUpperCase()));
}

function isProfane(s:string): boolean{
    if(!sourced){
        sourceWordsList();
    }
    var s1 : string =  "";
    for(var i  = 0; i < s.length; i++){
        //console.log(s.charAt(i))
        if(isLetter(s.charAt(i)) || s.charAt(i) === ' '){
            s1=s1.concat(s.charAt(i));
        }
    }
    console.log(s1);
    var tokens: Array<string> = s1.split(" ");

    for(var i = 0; i < tokens.length; i++){
        if(wordslist.has(tokens[i].toLowerCase())){
            return true;
        }
    }
    return false;

}


function testFilter(): void{
    addWord("uwu");
    console.log(isProfane("uwu"))
    console.log(isProfane("a big"))
    console.log(isProfane("a big uw-u"))
    console.log(isProfane(""))
}

export default isProfane