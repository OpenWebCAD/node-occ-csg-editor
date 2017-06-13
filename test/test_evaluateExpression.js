const should = require("should");
const Expression = require("../lib/geometry_editor").Expression;
const evaluateExpression = require("../lib/geometry_editor").evaluateExpression;

describe("testing expression evaluation",function(){

    it("should evaluate a simple expression",function() {

        const e = new Expression();
        e.exp = 10;

        const value  = evaluateExpression(e,[]);
        value.should.eql(10);

    });

    it("should evaluate a simple expression with parameter",function() {

        const e = new Expression();
        e.set("$a");

        const value  = evaluateExpression(e,[{id:"a",defaultValue:250}]);
        value.should.eql(250);

    });

    it("should evaluate a simple expression with parameters and formula",function() {

        const e = new Expression();
        e.set("$a * $b");

        const value  = evaluateExpression(e,[{id:"a",defaultValue:2},{id:"b",defaultValue:6}]);
        value.should.eql(12);

    });
});

