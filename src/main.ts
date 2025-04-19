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

    private tokensLeft() {
        return this._tokens.length - this._index;
    }

    private peek(amount: number = 0): Token {
        return this._tokens[this._index + amount];
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.peek().type != type) {
                return false;
            }
        }
        for (const _ of types) {
            this.advance();
        }
        return true;
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

    parse(): AST.Language {
        /*while(!this.isAtEnd()) {
            const token = this.peek();
            console.log(token);
            this.advance();
        }*/
       const lan = new AST.Language();
       lan.accept(this);
       return lan;
    }

    visitLanguage(node: AST.Language) {
        while(!this.isAtEnd()) {
            const rule = new AST.Rule();
            rule.accept(this);
            node.rules.push(rule);
        }
        return;
    }
    visitRule(node: AST.Rule) {
        const headToken = this.peek();
        this.advance();
        this.match(TokenType.ARROW);
        if(headToken.type == TokenType.RULE) {
            node.head = new AST.NonTerm(headToken.value, false);
        }
        else if(headToken.type == TokenType.IGNORE_RULE) {
            node.head = new AST.NonTerm(headToken.value, true);
        }
        else {
            throw Error(`Expected token ${TokenType[TokenType.RULE]}, but found ${TokenType[headToken.type]}`);
        }

        node.body.accept(this);
        if(!this.match(TokenType.SEMI_COL)) {
            throw Error(`Expected token ${TokenType[TokenType.SEMI_COL]}, near [${this.peek().lineno}:${this.peek().startPos}]`);
        }
        
    }
    visitProdList(node: AST.ProdList) {
        while(true) {
            const prod = new AST.Prod();
            prod.accept(this);
            node.list.push(prod);
            if(!this.match(TokenType.OR)) {
                break;
            }
        }
    }
    visitProd(node: AST.Prod) {
        while(this.peek().type == TokenType.LITERAL || this.peek().type == TokenType.RULE || this.peek().type == TokenType.LEFT_PAREN) {
            const expr = new AST.Expr();
            expr.accept(this);
            node.list.push(expr);
        }
    }
    visitExpr(node: AST.Expr) {
        node.elemGroup = new AST.ElemGroup();
        node.elemGroup.accept(this)
        if(this.peek().type == TokenType.STAR) {
            node.operator = TokenType.STAR;
            this.advance();
        } else if(this.peek().type == TokenType.PLUS) {
            node.operator = TokenType.PLUS;
            this.advance();
        }
    }
    visitElemGroup(node: AST.ElemGroup) {
        //TODO LOOP
            let isGroup = false;
            if(this.peek().type == TokenType.LEFT_PAREN) {
                this.match(TokenType.LEFT_PAREN);
                isGroup = true;
            }
            const elem = new AST.Elem();
            elem.accept(this);
            node.elems.push(elem);
            if(isGroup && !this.match(TokenType.RIGHT_PAREN)) {
                throw new Error(`Expected closing parethesis ')' near [${this.peek().lineno}, ${this.peek().startPos}]`);
            }
    }
    visitElem(node: AST.Elem) {
        let peek = this.peek();
        console.log(`${peek.toString()} / ${this.peek(1).toString()}`);
        if(this.tokensLeft() < 2) {
            throw new Error("Sudden finish of Token stream!");
        }
        
        if(peek.type == TokenType.RULE) {
            node.value = new AST.NonTerm();
        }
        else if(peek.type == TokenType.LITERAL) {
            node.value = new AST.Term();
        }
        node.value?.accept(this);

        peek = this.peek();
        if(peek.type == TokenType.LITERAL || peek.type == TokenType.RULE || peek.type == TokenType.LEFT_PAREN) {
            node.prodValue = new AST.Prod();
            node.prodValue.accept(this);
        }
    }
    visitNonTerm(node: AST.NonTerm) {
        const t = this.peek();
        node.value = t.value;
        this.advance();
    }
    visitTerm(node: AST.Term) {
        const t = this.peek();
        node.value = t.value;
        this.advance();
    }

}

export let input = `
    IGNORE ::= "COmment??" | "multilined comment";
    //"single line comm"
    /*possible multi-
    -lined comm!*/
    <RULE> ::= <NON-TERM>+ ((<ziriguidum>)* <ziriguidum>)+;
`;
const lexer = new Lexer(input);
const tokens = lexer.getTokens();
const parser = new Parser(tokens);
const lan = parser.parse();

// const lan = new AST.Language();
// lan.rules.push(new AST.Rule(new AST.NonTerm("LALA"), new AST.ProdList([
    //     new AST.Prod([new AST.Expr(new AST.ElemGroup(new AST.Elem(new AST.Term("TErminal"), AST.ElemType.TERM)), TokenType.STAR)]),
    //     new AST.Prod([new AST.Expr(new AST.ElemGroup(new AST.Elem(new AST.Term("TErminal2"), AST.ElemType.TERM)), /*TokenType.STAR*/)]),
    // ])));
    // lan.rules.push(new AST.Rule(new AST.NonTerm("sug8739")));
    // lan.rules.push(new AST.Rule(new AST.NonTerm("__363__asikdhjgf")));
let printer = new ASTPrinter();
printer.log(lan);
