const assert = require("assert");
const WidgetBase = require("./widget_base").WidgetBase;

class WidgetConnector {

    constructor(parent) {
        // note : it is possible that parent is null (during deserialization for instance)
        assert(!parent || parent instanceof Object, "expecting a parent");

        this._parent = parent;
        this._linked = null;

        if (this._parent) {
            this._parent._widgetConnectors = this._parent._widgetConnectors || [];
            this._parent._widgetConnectors.push(this);
        }
    }
    isValidConnectedObject(object) {
        throw new Error("WidgetConnector#isValidConnectedObject must be overridden",object);
    }
    set(object) {

        assert(this._parent instanceof Object);
        assert(!object || this.isValidConnectedObject(object) ,"WidgetConnector#set expecting a valid widget object");
        this.__removeDependantEntity();
        this._linked = object;
        this.__addDependantEntity();
    }

    get() {
        assert(!this._linked || this.isValidConnectedObject(this._linked ));
        return this._linked;
    }

    __addDependantEntity() {
        if (this._parent._id && this._linked) {
            this._linked._addDependantEntity(this._parent);
        }
    }

    __removeDependantEntity() {
        if (this._parent._id && this._linked) {
            this._linked._removeDependantEntity(this._parent);
        }
    }

    _replaceLink(oldObject, newObject) {
        assert( this.isValidConnectedObject(oldObject));
        assert( this.isValidConnectedObject(newObject));
        if (this.get() === oldObject) {
            this.set(newObject);
        }
    }

    establishLink() {
        this.__addDependantEntity();
    }

    dispose() {
        assert(this._parent instanceof WidgetBase);
        this.__removeDependantEntity();
        this._parent= null;
    }
}

exports.WidgetConnector = WidgetConnector;