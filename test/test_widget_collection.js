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
    constructor() {
        super();
        this.myLink1 = new MyWidgetConnector(this);
    }

    clone() {
        const clone = new MyWidget();
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

        const w1 = c.addSomeWidget();
        const w2 = c.addSomeWidget();
        const w3 = c.addSomeWidget();
        w1._id.should.equal(1);
        w2._id.should.equal(2);
        w3._id.should.equal(3);
    });

    it("should provide a list of possible widget to connect to",function() {

        const c = new MyWidgetCollection();
        const w1 = c.addSomeWidget();
        const w2 = c.addSomeWidget();
        const w3 = c.addSomeWidget();

        c.getPossibleAncestors(w1).length.should.eql(0);
        c.getPossibleAncestors(w2).length.should.eql(1);
        c.getPossibleAncestors(w3).length.should.eql(2);


    });



    it("should link element of a collection",function() {

        const c = new MyWidgetCollection();

        const w1 = c.addSomeWidget();
        const w2 = c.addSomeWidget();
        const w3 = c.addSomeWidget();

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
        const w1 = c.addSomeWidget();
        const w2 = c.addSomeWidget();
        const w3 = c.addSomeWidget();


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

        w2.canDelete().should.eql(true);

       - c.deleteItem(w2);
    })

});