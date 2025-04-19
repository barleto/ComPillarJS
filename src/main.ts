import { isComment, Lexer, Token } from "./Lexer";
import { TokenType } from "./TokenType";

namespace AST {
    class Language{

    }
    class Rule{

    }
    class ProdList{

    }
    class Prod{

    }
    class Expr{

    }
    class ElemGroup{

    }
    class Elem{

    }
}

class Parser {
    private _tokens: Token[];
    private _index = 0;
    constructor(tokens: Token[]) {
        this._tokens = tokens;
    }

    private peek(): Token {
        return this._tokens[this._index];
    }

    private match(...types: TokenType[]) {
        for(const type of types) {
            if(this.peek().type != type) {
                return;
            }
        }
        for(const _ of types){
            this.advance();
        }
    }
    
    private check(type: TokenType): boolean {
        return this.peek().type == type;
    }
    
     private isAtEnd(): boolean {
        return this.peek().type == TokenType.EOF;
      }
    
    private advance() : boolean {
        while(this._index < this._tokens.length) {
            if(this._index + 1 >= this._tokens.length) {
                return false;
            }
            this._index += 1;
            if(isComment(this.peek().type)) {
            	continue;    
            }
            break;
        }
        return true;
    }
    
    private previous() : boolean {
        while(this._index > 0) {
            if(this._index - 1 <= 0 ) {
                return false;
            }
            this._index -= 1;
            if(isComment(this.peek().type)) {
            	continue;    
            }
            break;
        }
        return true;
    }

    parse() {
        while(!this.isAtEnd()) {
            const token = this.peek();
            console.log(token);
            this.advance();
        }
    }

}

export var input = `
    IGNORE ::= "COmment??" | "multilined comment";
    //"single line comm"
    /*possible multi-
    -lined comm!*/
    <RULE> ::= <NON-TERM> ("lala\n+*\\()" | "AAA"| <ziriguidum>+)*;
    `;
const lexer = new Lexer(input);
const tokens = lexer.getTokens();
const parser = new Parser(tokens);
parser.parse();
