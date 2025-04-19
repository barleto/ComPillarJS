import { AST } from "./AST";
import { TokenType } from "./TokenType";


export class ASTPrinter implements AST.IVisitor<string> {
    private _indent = 0;
    log(node: AST.Node) {
        console.log(node.accept(this));
    }
    private parenthesize(name: string, ...nodes: AST.Node[]): string {
        const result: string[] = [];
        result.push("(");
        result.push(name);
        for (const node of nodes) {
            result.push(" ");
            result.push(node.accept(this));
        }
        result.push(")");
        return result.join("");
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
        result.push(`\n)`);
        return result.join("");
    }
    visitRule(node: AST.Rule): string {
        return `(${node.head.accept(this)} ::= BODY)`;
    }
    visitProdList(node: AST.ProdList): string {
        throw new Error("Method not implemented.");
    }
    visitProd(node: AST.Prod): string {
        throw new Error("Method not implemented.");
    }
    visitExpr(node: AST.Expr): string {
        if(!node.operator) {
            return node.elemGroup.accept(this);
        }
        else {
            return `(${TokenType[node.operator]} ${node.elemGroup.accept(this)})`;
        }
    }
    visitElemGroup(node: AST.ElemGroup): string {
        return `(G ${node.accept(this)})`;
    }
    visitElem(node: AST.Elem): string {
        return node.accept(this);
    }
    visitNonTerm(node: AST.NonTerm): string {
        return `<${node.value}>`;
    }
    visitTerm(node: AST.Term): string {
        return `"${node.value}"`;
    }
}
