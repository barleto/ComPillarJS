import { TokenType } from "./TokenType";

export namespace AST {
    export interface IVisitor<T> {
        visitLanguage(node: AST.Language): T;
        visitRule(node: AST.Rule): T;
        visitProdList(node: AST.ProdList): T;
        visitProd(node: AST.Prod): T;
        visitExpr(node: AST.Expr): T;
        visitElemGroup(node: AST.ElemGroup): T;
        visitElem(node: AST.Elem): T;
        visitNonTerm(node: AST.NonTerm): T;
        visitTerm(node: AST.Term): T;
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
        public body: ProdList = new ProdList();
        constructor(
            public head?: NonTerm,
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitRule(this);
        }
    }
    export class ProdList extends Node {
        constructor(public list: Prod[] = []) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitProdList(this);
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
            public elemGroup?: ElemGroup,
            public operator?: TokenType,
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitExpr(this);
        }
    }
    export class ElemGroup extends Node {
        constructor(
            public elems: Elem[] = [],
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitElemGroup(this);
        }
    }
    export enum ElemType {
        NON_TERM, TERM, PROD
    }
    export class Elem extends Node {
        constructor(
            public value?: (NonTerm|Term),
            public prodValue?: Prod,
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitElem(this);
        }
    }
    export class NonTerm extends Node {
        constructor(
            public value?: string,
            public ignore?: boolean,

        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitNonTerm(this);
        }
    }
    export class Term extends Node {
        constructor(
            public value?: string,
        ) {
            super();
        }
        override accept<T>(visitor: IVisitor<T>): T {
            return visitor.visitTerm(this);
        }
    }
}
