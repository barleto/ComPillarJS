import { AST } from "./AST";
import { Token, isComment } from "./Lexer";
import { TokenType } from "./TokenType";

export class Parser implements AST.IVisitor<any> {
    private _tokens: Token[];
    private _index = 0;
    constructor(tokens: Token[]) {
        this._tokens = tokens;
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
        while (!this.isAtEnd()) {
            const rule = new AST.Rule();
            node.rules.push(rule);
            rule.accept(this);
        }
    }
    visitRule(node: AST.Rule) {
        // console.log(`### RULE ${this.peek().toString()}`);
        const headToken = this.peek();
        this.advance();
        this.match(TokenType.ARROW);
        if (headToken.type == TokenType.RULE) {
            node.head = new AST.RuleName(headToken.value, false);
        }
        else if (headToken.type == TokenType.IGNORE_RULE) {
            node.head = new AST.RuleName(headToken.value, true);
        }
        else {
            throw Error(`Expected token ${TokenType[TokenType.RULE]}, but found ${TokenType[headToken.type]}`);
        }

        node.body.accept(this);
        // console.log(`### RULE BACK ${this.peek().toString()}`);
    }
    visitProd(node: AST.Prod) {
        // console.log(`### PROD ${this.peek().toString()}`);
        while (this.peek().type != TokenType.SEMI_COL && this.peek().type != TokenType.RIGHT_PAREN) {
            const expr = new AST.Expr();
            node.list.push(expr);
            expr.accept(this);
            // console.log(`### PROD BACK ${this.peek().toString()}`);
        }
        !this.match(TokenType.SEMI_COL);
    }
    visitExpr(node: AST.Expr) {
        // console.log(`### EXPR ${this.peek().toString()}`);
        do {
            const operand = new AST.Operand();
            node.operands.push(operand);
            operand.accept(this);
            // console.log(`### EXPR BACK ${this.peek().toString()}`);
        }
        while (this.match(TokenType.OR));
    }
    visitOperand(node: AST.Operand) {
        do {
            // console.log(`### OPER ${this.peek().toString()}`);
            const term = new AST.Term();
            node.terms.push(term);
            term.accept(this);
            switch (this.peek().type) {
                case TokenType.STAR:
                case TokenType.PLUS:
                case TokenType.QUEST:
                    node.operators.push(this.peek().type);
                    this.advance();
                    break;
                default:
                    node.operators.push(null);
                    break;
            }
            // console.log(`### OPER BACK ${this.peek().toString()}`);
        }
        while (this.check(TokenType.LITERAL) || this.check(TokenType.RULE) || this.check(TokenType.LEFT_PAREN));
    }
    visitTerm(node: AST.Term) {
        // console.log(`### TERM ${this.peek().toString()}`);
        const peek = this.peek();
        if (peek.type == TokenType.RULE) {
            node.value = new AST.RuleName();
            node.type = AST.TermType.RULE_NAME;
            node.value?.accept(this);
        }
        else if (peek.type == TokenType.LITERAL) {
            node.value = new AST.Literal();
            node.type = AST.TermType.LITERAL;
            node.value?.accept(this);
        }
        else if (peek.type == TokenType.LEFT_PAREN) {
            node.value = new AST.Expr();
            node.type = AST.TermType.EXPR;
            this.match(TokenType.LEFT_PAREN);
            node.value.accept(this);
            this.match(TokenType.RIGHT_PAREN);
        }
        // console.log(`### TERM BACK ${this.peek().toString()}`);
    }
    visitRuleName(node: AST.RuleName) {
        const token = this.peek();
        node.value = token.value;
        this.advance();
    }
    visitLiteral(node: AST.Literal) {
        const token = this.peek();
        node.value = token.value;
        this.advance();
    }
}
