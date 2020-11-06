let wordslist: Set<String> = new Set<String>()


function addWord(s: String): void {
    wordslist.add(s.toLowerCase());
}


function isLetter(s: String): boolean {
    return (s.length === 1 && (s.toLowerCase() != s.toUpperCase()));
}

function isProfane(s:String): boolean{
    var s1 : String =  "";
    for(var i  = 0; i < s.length; i++){
        //console.log(s.charAt(i))
        if(isLetter(s.charAt(i)) || s.charAt(i) === ' '){
            s1=s1.concat(s.charAt(i));
        }
    }
    console.log(s1);
    var tokens: Array<String> = s1.split(" ");

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
