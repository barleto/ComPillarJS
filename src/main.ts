import { Lexer } from "./Lexer";

export var input = `
    IGNORE ::= "COmment??" | "multilined comment";
    //"single line comm"
    /*possible multi-
    -lined comm!*/
    <RULE> ::= <NON-TERM> ("lala\n+*\\()" | "AAA"| <ziriguidum>+)*;
    `;
const lexer = new Lexer(input);
const tokens = lexer.getTokens();
for(const t of tokens) {
    console.log(t.toString());
}
