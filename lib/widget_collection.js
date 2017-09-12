
const WidgetBase = require("./widget_base").WidgetBase;
const WidgetBaseBase = require("./widget_base").WidgetBaseBase;

const assert = require("assert");


class WidgetCollectionBase {

    constructor() {
        this.items = [];
    }

    /**
     * returns the base class of the items allowed in this collection
     *
     * @returns {WidgetBase}
     */
    getWidgetBaseClass(){
        return WidgetBase;
    }


    _coerceToIndex(widgetOrIndex) {
        let index = widgetOrIndex;
        if (widgetOrIndex instanceof WidgetBaseBase) {
            index = this.items.findIndex(e => e === widgetOrIndex);
        }
        if (!(index >= 0 && index < this.items.length)) {
            throw new Error("Cannot find element "+ widgetOrIndex);
        }
        return index;
    }
    _coerceToWidget(wigdetLike) {
        const index = this._coerceToIndex(wigdetLike);
        return this.items[index];
    }


}


class IdGenerator {
    static getNextId() {
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        const guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        return guid;
    };
}

class WidgetCollection  extends WidgetCollectionBase {

    constructor() {
        super();
        this.__counter = 0;
    }

    getNextId() {
        return IdGenerator.getNextId();
    }

    _registerWidget(widget) {
        assert(widget instanceof this.getWidgetBaseClass());
        assert(widget instanceof WidgetBase);
        assert(!widget._id, "widget should not be already registered");
        this.items.push(widget);
        widget._id = this.getNextId();
        widget.establishLink();
        return widget;
    }
    __getNextNameWithPrefix(prefix) {
        const guessName = prefix + this.__counter++;
        // to do iterate until a unused name is found
        return guessName;
    }

    getWidgetListToPoint(index) {
        assert(index >= 0 && index < this.items.length, " invalid widget index");

        const widgets = [];
        for (let i = 0; i < index; i++) {
            const widget = this.items[i];
            widgets.push(widget);
        }
        return widgets;
    }

    getPossibleAncestors(widget) {
        assert(widget instanceof this.getWidgetBaseClass());
        assert(typeof widget._id !== null, " widget must be handled by editor | Are you passing a cloned entity ? you shouldn't");

        if (this.items.length === 0) {
            return [];
        }
        const index = this.items.findIndex(x => x._id === widget._id);
        assert(index >= 0, " widget must exists in collection");
        return this.getWidgetListToPoint(index);
    }

    /**
     * return true if the Widget can be deleted
     * (i.e if the Widget is not used by an other one)
     * @param widgetOrIndex
     */
    canDelete(widgetOrIndex) {
        const index = this._coerceToIndex(widgetOrIndex);
        return this.items[index].getDependantEntities().length === 0;
    }

    getWidgetByName(name) {
        const matchingWidgets = this.items.filter(e=> e.name === name);
        return matchingWidgets[0];
    }

    deleteItem(widgetOrIndex) {
        const index = this._coerceToIndex(widgetOrIndex);
        const oldWidget = this.items[index];
        oldWidget._parent = null;

        // let make sure that dependent entities doesn't reference
        // oldWidget anymore
        oldWidget.getDependantEntities().forEach(e=> e._replaceLink(oldWidget,null));

        oldWidget.dispose();
        this.items.splice(index, 1);
    }



    checkReplaceItem(oldWidgetLike, newWidget, errorList) {

        errorList = errorList || [];

        if (!newWidget) {
            errorList.push("invalid widget");
            return false;
        }
        assert(newWidget instanceof this.getWidgetBaseClass());
        assert(newWidget._id === null, "new Widget must not have been assigned to editor yet");

        const oldWidget = this._coerceToWidget(oldWidgetLike);
        assert(oldWidget instanceof this.getWidgetBaseClass());
        assert(oldWidget._id !== null, "old Widget must  have been assigned to editor already");

        // we must first verify that newWidget can be inserted in place
        // for this:
        //   - any entity that is used by newWidget connectors should belongs to
        //     the potential entities
        const possibleAncestors = this.getPossibleAncestors(oldWidget);

        const connectors = newWidget.getWidgetConnectors(this.getWidgetBaseClass());

        const already_used = [];



        for (let i = 0; i < connectors.length; i++) {

            const connector = connectors[i];
            const my_filter = (e) => e === connector.get();

            const indexInAlreadyUsed = already_used.findIndex(my_filter);
            if (indexInAlreadyUsed >= 0) {
                errorList.push("a link duplication has been found : " + connector.get().name + " is referenced twice by the entity");
                break;
            }
            if (!connector.get()) {
                errorList.push("a link with a existing entity is not defined ");
                break;
            }
            const indexInPossibleAncestor = possibleAncestors.findIndex(my_filter);
            if (indexInPossibleAncestor < 0) {
                errorList.push("a link with a invalid entity has been found : " + connector.get().name + " possibleAncestors [ " + possibleAncestors.map(e => e.name).join(",") + "]");
                break;
            }
            already_used.push(connector.get());
        }

        return errorList.length === 0;
    }


    replaceItem(widgetOrIndex, newWidget) {

        assert(newWidget instanceof WidgetBase);
        assert(newWidget instanceof  this.getWidgetBaseClass(),"replaceItem: new widget is not of the expected class");
        assert(newWidget._id == null, "Widget must not have been assigned to editor yet");

        const oldWidget = this._coerceToWidget(widgetOrIndex);
        const index    = this._coerceToIndex(widgetOrIndex);
        assert(oldWidget instanceof WidgetBase);

        if (!this.checkReplaceItem(index, newWidget)) {
            const errorList = [];
            this.checkReplaceItem(index, newWidget, errorList);
            throw new Error("Cannot replace item  \n" + errorList.join("\n"));
        }

        newWidget._id = oldWidget._id;
        this.items[index] = newWidget;


        const dep = oldWidget.getDependantEntities();

        oldWidget.dispose();
        for (let i = 0; i < dep.length; i++) {
            const depWidget = dep[i];
            depWidget._replaceLink(oldWidget, newWidget);
        }
        newWidget.establishLink();

        newWidget.isVisible = oldWidget.isVisible;
    }

    extractSubset(itemsToExtract) {

        const visitedMap ={};

        const element_to_create  = [];

        const subset = new (this.constructor)();

        function is_visited(item) {
            return visitedMap[item._id];
        }
        function mark_as_visited(item) {
            element_to_create.push(item);
            visitedMap[item._id] = item;
        }

        function visit(item) {
            if (!is_visited(item)) {

                item.getWidgetConnectors().forEach(connector=>{
                    const linked = connector.get();
                    if (linked && !is_visited(linked)) {
                        visit(linked);
                    }
                });

                mark_as_visited(item);
            }

        }
        itemsToExtract.forEach(visit);

        const cloned = {};

        element_to_create.forEach(item => {

            const clone = item.clone();
            assert(clone._id === null,"no id on clone!");
            // replace connector with new clone
            clone.getWidgetConnectors().forEach(connector=>{
                const linked_orig = connector.get();
                if (linked_orig) {
                    const new_linked = cloned[linked_orig._id];
                    assert(new_linked,"expecting to find the corresponding cloned entity here");
                    connector.set(null);
                    connector.set(new_linked);
                }
            });
            cloned[item._id] = clone;
            clone._id = item._id;
            subset.items.push(clone);
            clone.establishLink();

        });

        return subset;
    }
}

exports.WidgetCollectionBase = WidgetCollectionBase;

exports.WidgetCollection = WidgetCollection;