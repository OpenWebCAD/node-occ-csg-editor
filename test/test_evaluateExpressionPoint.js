const should = require("should");
const ExpressionPoint = require("../lib/geometry_editor").ExpressionPoint;
const evaluateExpressionPoint = require("../lib/geometry_editor").evaluateExpressionPoint;


describe("testing ExpressionPoint evaluation",function(){

    it("should evaluate a simple ExpressionPoint",function() {

        const e = new ExpressionPoint();
        e.X.set(10);
        e.Y.set(20);
        e.Z.set(30);
        const value  = evaluateExpressionPoint(e,[]);
        value.should.eql([10,20,30]);

    });

    it("should evaluate a simple ExpressionPoint with parameter",function() {

        const e = new ExpressionPoint();
        e.X.set("$a");
        e.Y.set("-$a");
        e.Z.set("$a*2");

        const value  = evaluateExpressionPoint(e,[{id:"a",defaultValue:10}]);
        value.should.eql([10,-10,20]);

    });

    it("should evaluate a simple ExpressionPoint with parameters and formula",function() {

        const e = new ExpressionPoint();
        e.X.set("$a *$b");
        e.Y.set("-$a");
        e.Z.set("Math.atan(1)");

        const value  = evaluateExpressionPoint(e,[{id:"a",defaultValue:2},{id:"b",defaultValue:6}]);
        value.should.eql([12,-2,Math.atan(1)]);

    });
});