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
        this._indent--;
        result.push(`\n)`);
        return result.join("");
    }
    visitRule(node: AST.Rule): string {
        
        return `(${node.head.accept(this)} ::= ${node.body.accept(this)})`;
    }
    visitProdList(node: AST.ProdList): string {
        if(node.list.length <= 0) {
            return "()";
        }
        const result: string[] = [];
        result.push('(');
        this._indent++;
        result.push(this.indent());
        for(const prod of node.list) {
            result.push('\n');
            result.push(this.indent());
            result.push(prod.accept(this));
        }
        result.push("\n");
        this._indent--;
        result.push(this.indent());
        result.push(")");
        return result.join("");
    }
    visitProd(node: AST.Prod): string {
        if(node.list.length <= 0) {
            return "()";
        }
        const result: string[] = [];
        for(const expr of node.list) {
            result.push(`(${expr.accept(this)}) `);
        }
        return result.join("");
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
        return `(G ${node.elem.accept(this)})`;
    }
    visitElem(node: AST.Elem): string {
        return node.value.accept(this);
    }
    visitNonTerm(node: AST.NonTerm): string {
        return `<${node.value}>`;
    }
    visitTerm(node: AST.Term): string {
        return `"${node.value}"`;
    }
}
