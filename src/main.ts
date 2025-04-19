import { AST } from "./AST";
import { ASTPrinter } from "./ASTPrinter";
import { isComment, Lexer, Token } from "./Lexer";
import { TokenType } from "./TokenType";

class Parser implements AST.IVisitor<any> {
    private _tokens: Token[];
    private _index = 0;
    constructor(tokens: Token[]) {
        this._tokens = tokens;
    }

    private peek(): Token {
        return this._tokens[this._index];
    }

    private match(...types: TokenType[]) {
        for (const type of types) {
            if (this.peek().type != type) {
                return;
            }
        }
        for (const _ of types) {
            this.advance();
        }
    }

    private check(type: TokenType): boolean {
        return this.peek().type == type;
    }

    private isAtEnd(): boolean {
        return this.peek().type == TokenType.EOF;
    }

    private advance(): boolean {
        while (this._index < this._tokens.length) {
            if (this._index + 1 >= this._tokens.length) {
                return false;
            }
            this._index += 1;
            if (isComment(this.peek().type)) {
                continue;
            }
            break;
        }
        return true;
    }

    private previous(): boolean {
        while (this._index > 0) {
            if (this._index - 1 <= 0) {
                return false;
            }
            this._index -= 1;
            if (isComment(this.peek().type)) {
                continue;
            }
            break;
        }
        return true;
    }

    parse() {
        /*while(!this.isAtEnd()) {
            const token = this.peek();
            console.log(token);
            this.advance();
        }*/

    }

    visitLanguage(node: AST.Language) {
        throw new Error("Method not implemented.");
    }
    visitRule(node: AST.Rule) {
        throw new Error("Method not implemented.");
    }
    visitProdList(node: AST.ProdList) {
        throw new Error("Method not implemented.");
    }
    visitProd(node: AST.Prod) {
        throw new Error("Method not implemented.");
    }
    visitExpr(node: AST.Expr) {
        throw new Error("Method not implemented.");
    }
    visitElemGroup(node: AST.ElemGroup) {
        throw new Error("Method not implemented.");
    }
    visitElem(node: AST.Elem) {
        throw new Error("Method not implemented.");
    }
    visitNonTerm(node: AST.NonTerm) {
        throw new Error("Method not implemented.");
    }
    visitTerm(node: AST.Term) {
        throw new Error("Method not implemented.");
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

var printer = new ASTPrinter();
const lan = new AST.Language();
lan.rules.push(new AST.Rule(new AST.NonTerm("LALA"), new AST.ProdList([
    new AST.Prod([new AST.Expr(new AST.ElemGroup(new AST.Elem(new AST.Term("TErminal"), AST.ElemType.TERM)), TokenType.STAR)]),
    new AST.Prod([new AST.Expr(new AST.ElemGroup(new AST.Elem(new AST.Term("TErminal2"), AST.ElemType.TERM)), /*TokenType.STAR*/)]),
])));
lan.rules.push(new AST.Rule(new AST.NonTerm("sug8739")));
lan.rules.push(new AST.Rule(new AST.NonTerm("__363__asikdhjgf")));
printer.log(lan);
