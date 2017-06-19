const assert = require("assert");
const WidgetConnector = require("./widget_connector").WidgetConnector;
const WidgetCollectionBase = require("./widget_collection").WidgetCollectionBase;
const WidgetBase = require("./widget_base").WidgetBase;
const WidgetBaseBase = require("./widget_base").WidgetBaseBase;
const WidgetBaseConn = require("./widget_base_conn").WidgetBaseConn;


class WidgetConnectorList extends WidgetCollectionBase {

    constructor(parent) {
        super();
        this._parent = parent;
        if (this._parent) {
            assert(this._parent instanceof WidgetBase);
            this._parent._subWidgetCollection = this._parent._subWidgetCollection || [];
            this._parent._subWidgetCollection.push(this);
        }
    }

    getWidgetClass() {
        throw new Error("WidgetConnectorList#getWidgetClass must be overridden");
    }

    getWidgetConnectors(optionalBaseClass) {
        assert(!optionalBaseClass || optionalBaseClass instanceof Function);
        const results = this.items.map(item=>item.getWidgetConnectors(optionalBaseClass));
        // now flatten the results
        return [].concat.apply([],results);
    }

    addNewItem() {
        assert(this._parent,"expecting a parent Here");
        const ClassName = this.getWidgetClass();

        const object = new ClassName(this._parent);
        assert(object instanceof WidgetBaseConn,"ClassName must be a WidgetBaseConn");

        assert(object.getWidgetConnectors().length >= 1,"WidgetConnectorList must expose objects with connectors");


        assert(object instanceof WidgetBaseConn,"WidgetConnectorList must contain WidgetBaseConn");
        assert(!(object instanceof WidgetBase),"WidgetConnectorList doesn't accept WidgetBase");
        assert(this._parent instanceof WidgetBase);
        this.items.push(object);
        return object;
    }

    removeItem(elementOrIndex) {
        const index = this._coerceToIndex(elementOrIndex);
        const item = this.items[index];
        // dissociate all elements
        const connectors = item.getWidgetConnectors();
        connectors.forEach(connector=>connector.set(null));
        //xx item.dispose();
        this.items.splice(index, 1);
    }
    // setAt(index, object) {
    //
    //     assert(this._parent instanceof Object);
    //     assert(!object || this.isValidConnectedObject(object), "WidgetConnector#set expecting a valid widget object");
    //     this.__removeDependantEntity();
    //     this._linked = object;
    //     this.__addDependantEntity();
    // }
    //
    // getAt(index) {
    //     assert(!this._linked || this.isValidConnectedObject(this._linked));
    //     return this._linked;
    // }
}
exports.WidgetBaseConn = WidgetBaseConn;
exports.WidgetConnectorList = WidgetConnectorList;
