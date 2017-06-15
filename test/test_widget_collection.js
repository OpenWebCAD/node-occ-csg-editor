const WidgetBase = require("../lib/widget_base").WidgetBase;
const WidgetCollection = require("../lib/widget_collection").WidgetCollection;
const WidgetConnector = require("../lib/widget_connector").WidgetConnector;
const should =require("should");

let future_MyWidget;
class MyWidgetConnector extends WidgetConnector
{
    isValidConnectedObject(object) {
        return object instanceof future_MyWidget;
    }
}

class MyWidget extends WidgetBase
{
    constructor(name) {
        super(name);
        this.myLink1 = new MyWidgetConnector(this);
    }

    clone() {
        const clone = new MyWidget(this.name);
        clone.myLink1.set(this.myLink1.get());
        return clone;
    }
}
future_MyWidget = MyWidget;


class MyWidgetCollection extends  WidgetCollection
{

    addSomeWidget() {
        return this._registerWidget(new MyWidget());
    }
}
describe("WidgetCollection",function(){

    it("should create a collection",function() {

        const c = new MyWidgetCollection();

        const w1 = c.addSomeWidget("w1");
        const w2 = c.addSomeWidget("w2");
        const w3 = c.addSomeWidget("w3");
        w1._id.should.equal(1);
        w2._id.should.equal(2);
        w3._id.should.equal(3);
    });

    it("should provide a list of possible widget to connect to",function() {

        const c = new MyWidgetCollection();
        const w1 = c.addSomeWidget("w1");
        const w2 = c.addSomeWidget("w2");
        const w3 = c.addSomeWidget("w3");

        c.getPossibleAncestors(w1).length.should.eql(0);
        c.getPossibleAncestors(w2).length.should.eql(1);
        c.getPossibleAncestors(w3).length.should.eql(2);


    });



    it("should link element of a collection",function() {

        const c = new MyWidgetCollection();

        const w1 = c.addSomeWidget("w1");
        const w2 = c.addSomeWidget("w2");
        const w3 = c.addSomeWidget("w3");

        w1.getDependantEntities().length.should.eql(0);
        w2.getDependantEntities().length.should.eql(0);
        w3.getDependantEntities().length.should.eql(0);

        w3.myLink1.set(w1);
        w1.getDependantEntities().length.should.eql(1);
        w1.getDependantEntities()[0].should.equal(w3);


        w3.myLink1.set(null);

        w2.myLink1.set(null);

    });

    it("should prevent deletion of entity that are observed by others",function() {
        const c = new MyWidgetCollection();

        const w1 = c.addSomeWidget();
        w1.canDelete().should.eql(true);

        const w2 = c.addSomeWidget();
        w1.canDelete().should.eql(true);
        w2.canDelete().should.eql(true);

        w2.myLink1.set(w1);
        w1.canDelete().should.eql(false);
        w2.canDelete().should.eql(true);

    });

    it("should be able to edit one element and replace it",function() {
        const c = new MyWidgetCollection();
        const w1 = c.addSomeWidget("w1");
        const w2 = c.addSomeWidget("w2");
        const w3 = c.addSomeWidget("w3");


        w2.myLink1.set(w1);
        w3.myLink1.set(w2);

        // now change and replace last element

        const cloned_w3 = w3.clone();
        should.not.exist(cloned_w3._id,"cloned object should not have an id");

        c.checkReplaceItem(w3,cloned_w3).should.eql(true);

    });

    it("should be possible to delete an element from the collection",function() {

        const c = new MyWidgetCollection();
        const w1 = c.addSomeWidget();
        const w2 = c.addSomeWidget();
        w2.myLink1.set(w1);

        c.items.length.should.eql(2);


        w2.canDelete().should.eql(true);
        c.deleteItem(w2);

        c.items.length.should.eql(1);
    });


    it("should be possible to extract a sub set ",function() {

        const c = new MyWidgetCollection();
        const w1 = c.addSomeWidget("w1");
        const w2 = c.addSomeWidget("w2");
        w2.myLink1.set(w1);

        const w3 = c.addSomeWidget("w3");
        w3.myLink1.set(w1);

        const w4 = c.addSomeWidget("w4");

        w1.getDependantEntities().length.should.eql(2,"w1 is referenced by w2 and w3");
        w2.getDependantEntities().length.should.eql(0);
        w4.getDependantEntities().length.should.eql(0);

        const subset = c.extractSubset([w2,w4]);
         subset.should.be.instanceof(MyWidgetCollection);

        subset.items.length.should.eql(3);

        subset.items.map(x=>x._id).join(" ").should.eql("1 2 4");

        subset.items[0]._id.should.eql(w1._id);
        subset.items[1]._id.should.eql(w2._id);
        subset.items[2]._id.should.eql(w4._id);

        const ww1 = subset.items[0];
        const ww2 = subset.items[1];
        const ww4 = subset.items[2];

        ww1.getDependantEntities().length.should.eql(1);
        ww2.getDependantEntities().length.should.eql(0);
        ww4.getDependantEntities().length.should.eql(0);
    });

});