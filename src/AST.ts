import { TokenType } from "./TokenType";

export namespace AST {
    export interface IVisitor<T> {
        visitLanguage(node: AST.Language): T;
        visitRule(node: AST.Rule): T;
        visitProd(node: AST.Prod): T;
        visitExpr(node: AST.Expr): T;
        visitOperand(node: AST.Operand): T;
        visitTerm(node: AST.Term): T;
        visitRuleName(node: AST.RuleName): T;
        visitLiteral(node: AST.Literal): T;
    }

    export abstract class Node {
        abstract accept<T>(visitor: IVisitor<T>): T;
    }
    export class Language extends Node {
        rules: Rule[] = [];
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitLanguage(this);
        }
    }
    export class Rule extends Node {
        public body: Prod = new Prod();
        constructor(
            public head?: RuleName,
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitRule(this);
        }
    }
    export class Prod extends Node {
        constructor(
            public list: Expr[] = [],
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitProd(this);
        }
    }
    export class Expr extends Node {
        constructor(
            public operands: Operand[] = [],
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitExpr(this);
        }
    }
    export class Operand extends Node {
        constructor(
            public terms: Term[] = [],
            public operators: (TokenType|null)[] =[],
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitOperand(this);
        }
    }
    export enum TermType {
        RULE_NAME, LITERAL, EXPR
    }
    export class Term extends Node {
        constructor(
            public value?: (RuleName|Literal|Expr),
            public type?: TermType,
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitTerm(this);
        }
    }
    export class RuleName extends Node {
        constructor(
            public value?: string,
            public ignore?: boolean,

        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitRuleName(this);
        }
    }
    export class Literal extends Node {
        constructor(
            public value?: string,
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitLiteral(this);
        }
    }
}
