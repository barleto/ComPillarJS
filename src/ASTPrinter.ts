import { AST } from "./AST";
import { TokenType } from "./TokenType";


export class ASTPrinter implements AST.IVisitor<string> {
    private _indent = 0;
    log(node: AST.Node) {
        console.log(node.accept(this));
    }

    private indent(): string {
        const res: string[] = [];
        for (let i = 0; i < this._indent; i++) {
            res.push("  ");
        }
        return res.join("");
    }

    visitLanguage(node: AST.Language): string {
        var result: string[] = [];
        result.push(`(`);
        this._indent++;
        for (const rule of node.rules) {
            result.push(`\n`);
            result.push(this.indent());
            result.push(this.visitRule(rule));
        }
        this._indent--;
        result.push(`\n)`);
        return result.join("");
    }
    visitRule(node: AST.Rule): string { 
        return `(${node.head!.accept(this)} ::= ${node.body.accept(this)})`;
    }
    visitProd(node: AST.Prod): string {
        if(node.list.length <= 0) {
            return "()";
        }
        const result: string[] = [];
        result.push(`(PRODs\n`);
        this._indent++;
        result.push(this.indent());
        for(const expr of node.list) {
            result.push(' ');
            result.push(expr.accept(this));
        }
        result.push("\n");
        this._indent--;
        result.push(this.indent());
        result.push(")");
        return result.join("");   
    }
    visitExpr(node: AST.Expr): string {
        const res: string[] = [];
        for(const op of node.operands) {
            res.push(op.accept(this));
        }
        return res.join(" | ");
    }
    visitOperand(node: AST.Operand): string {
        const res: string[] = [];
        for(let i = 0; i < node.terms.length; i++) {
            const term = node.terms[i];
            const operator = node.operators[i];
            if(!operator) {
                res.push(term.accept(this));
            }
            else {
                res.push(`(${TokenType[operator]} `);
                res.push(term.accept(this));
                res.push(`) `);
            }
        }
        return res.join(" ");
    }
    visitTerm(node: AST.Term): string {
        return node.value!.accept(this);
    }
    visitRuleName(node: AST.RuleName): string {
        return node.value!;
    }
    visitLiteral(node: AST.Literal): string {
        return node.value!;
    }

}
