const WidgetBase = require("../lib/widget_base").WidgetBase;
const WidgetCollection = require("../lib/widget_collection").WidgetCollection;
const WidgetConnector = require("../lib/widget_connector").WidgetConnector;
const should =require("should");

let future_MyWidget;
class MyWidgetConnector extends WidgetConnector
{
    getWidgetClass() {
        return future_MyWidget;
    }
}

let future_YourWidget = null;
class YourWidgetConnector extends WidgetConnector
{
    getWidgetClass() {
        return future_YourWidget;
    }
}

class MyWidget extends WidgetBase
{
    constructor(name) {
        super(name);
        this.myLink1 = new MyWidgetConnector(this);
        this.myLink2 = new YourWidgetConnector(this);
    }

    clone() {
        const clone = new MyWidget(this.name);
        clone.myLink1.set(this.myLink1.get());
        clone.myLink2.set(this.myLink2.get());
        return clone;
    }
}
future_MyWidget = MyWidget;

class YourWidget extends WidgetBase
{
    constructor(name) {
        super(name);
    }

    clone() {
        const clone = new YourWidget(this.name);
        return clone;
    }
}
future_YourWidget = YourWidget;

class MyWidgetCollection extends  WidgetCollection
{

    addSomeWidget(name) {
        return this._registerWidget(new MyWidget(name));
    }
    getWidgetBaseClass(){
        return MyWidget;
    }
}
describe("WidgetCollection",function(){

    it("should create a collection",function() {

        const c = new MyWidgetCollection();

        const w1 = c.addSomeWidget("w1");
        const w2 = c.addSomeWidget("w2");
        const w3 = c.addSomeWidget("w3");
        w1._id.should.not.equal(null);
        w2._id.should.not.equal(null);
        w3._id.should.not.equal(null);
        w1._id.should.not.equal(w2._id);
        w1._id.should.not.equal(w3._id);
        w2._id.should.not.equal(w3._id);
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

        // let connect w3 to w1
        w3.myLink1.set(w1);
        w1.getDependantEntities().length.should.eql(1);
        w1.getDependantEntities()[0].should.equal(w3);


        // let disconnect w3 from w1
        w3.myLink1.set(null);
        w1.getDependantEntities().length.should.eql(0);

    });

    it("WidgetBase#canDelete : it should prevent deletion of entity that are observed by others",function() {
        const c = new MyWidgetCollection();

        const w1 = c.addSomeWidget();
        w1.canDelete().should.eql(true);

        const w2 = c.addSomeWidget();
        w1.canDelete().should.eql(true);
        w2.canDelete().should.eql(true);

        w2.myLink1.set(w1);
        w1.canDelete().should.eql(false,"w1 cannot be delete because it is referenced by w2");
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

        w2._id.should.eql("disposed","Item should now be marked as disposed");

        c.items.length.should.eql(1);
    });

    it("WidgetBase#deleteWithDependant : it should reset linked on dependant entities when an item is deleted",function() {

        const c = new MyWidgetCollection();
        const w1 = c.addSomeWidget();
        const w2 = c.addSomeWidget();
        w2.myLink1.set(w1); // w2 uses w1 => w2 is the parent and w1 is the child

        w1.canDelete().should.eql(false);

        // even though canDelete is false, the item can deleted, this will affect dependant entities
        c.deleteItem(w1);

        // in this case w2.myLink1 should now be  set to null because w1 doesn't exist in the collection anymore
        should.not.exist(w2.myLink1.get());
        w1._id.should.eql("disposed","Item should now be marked as disposed");
    });

    it("should be possible to extract a sub set ",function() {

        // Given  a widget collection with a nest of 4 items
        //
        //    w1 , w2 (=> w1) , w3 (=> w1) , w4

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


        // When I extract a subset on [w2,w4]
        const subset = c.extractSubset([w2,w4]);
        subset.should.be.instanceof(MyWidgetCollection);

        // Then this subset should only contains
        // w1 , w2 (=> w1), and w4
        // ( note that:
        //     - w1 has been added because it is needed by w2
        //     - w3 is left excluded.

        subset.items.length.should.eql(3);


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

    it("should not interfere with external links ",function() {

        const c = new MyWidgetCollection();

        const extra = new YourWidget("Extra");

        extra._id= 3456;

        const w1 = c.addSomeWidget("w1");
        const w2 = c.addSomeWidget("w2");
        w2.myLink1.set(w1);
        w2.myLink2.set(extra);

        c.getPossibleAncestors(w2).length.should.eql(1);

        should.throws(function() {
            c.replaceItem(w1,extra);
        });

        // ------------------------------------------------
        // now simulate edition
        // ------------------------------------------------

        const cloned_w1 = w1.clone();
        cloned_w1.name = "new Name";

        c.replaceItem(w1,cloned_w1);

    });

});