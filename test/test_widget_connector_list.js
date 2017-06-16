
const WidgetBase = require("../lib/widget_base").WidgetBase;
const WidgetCollection = require("../lib/widget_collection").WidgetCollection;
const WidgetConnector = require("../lib/widget_connector").WidgetConnector;
const should =require("should");

const WidgetConnectorList = require("../lib/widget_connector_list").WidgetConnectorList;


class LittleThing extends WidgetBase
{

}

class LittleThingyConnector extends WidgetConnector
{
    getWidgetClass() { return LittleThing; }
}

class Ingredient extends WidgetBase
{
    constructor(name) {
        super(name);
        this.thiny = new LittleThingyConnector(this);
        this.quantity = 1;
    }
}

class MyStuffConnectorList extends WidgetConnectorList
{
    getWidgetClass() {
        return Ingredient;
    }
}

class Recipe extends WidgetBase
{
    constructor(name) {
        super(name);
        this._subObject = new MyStuffConnectorList(this);
    }

    addIngredient() {
        const ingredient = new Ingredient();
        this._subObject.add(ingredient);
        return ingredient;
    }

    getIngredient(index) {
        if (!(index >=0 && index <this._subObject.length)) {
            throw new Error("invalid index specified");
        }
        return this._subObject[index];
    }

    clone() {
        const clone = new MyStuffConnectorList(this.name);
        return clone;
    }
}



class MyWidgetCollection2 extends  WidgetCollection
{

    addComplexWidget() {
        return this._registerWidget(new Recipe());
    }
    addLittleThing() {
        return this._registerWidget(new LittleThing());
    }
    getWidgetBaseClass(){
        return WidgetBase;
    }
}
describe("WidgetCollectionList",function() {


    it("should create a widget collection",function() {

        const wc = new MyWidgetCollection2();

        const lt1= wc.addLittleThing();
        const lt2= wc.addLittleThing();
        const lt3= wc.addLittleThing();
        const lt4= wc.addLittleThing();
        const lt5= wc.addLittleThing();

        const complexWidget = wc.addComplexWidget();

        complexWidget.getWidgetConnectors().length.should.eql(0);

        // the widget
        const ingredient1 = complexWidget.addIngredient();
        complexWidget.getWidgetConnectors().length.should.eql(1);

        ingredient1.thiny.set(lt1);
        ingredient1.quantity = 42;


        const ingredient2 = complexWidget.addIngredient();
        complexWidget.getWidgetConnectors().length.should.eql(2);

        ingredient2.thiny.set(lt2);
        ingredient2.quantity = 1;

        const ingredient3 = complexWidget.addIngredient();
        complexWidget.getWidgetConnectors().length.should.eql(3);

        ingredient3.thiny.set(lt3);
        ingredient3.quantity = 32;

        //xx const connector = theWidget.myLinkCollection.add()


    });

});