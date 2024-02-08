/*:
 * @plugindesc Use items as money!
 * @author TheChilliPL
 *
 * @param items
 * @text Items
 * @desc List of items that can be used as money. The cost of the item will be used as its value.
 * @type item[]
 */
var CLL;
(function (CLL) {
    var ItemCash;
    (function (ItemCash) {
        ItemCash.parameters = PluginManager.parameters("CLL_ItemCash");
        ItemCash.cashItems = [];
        var DataManager_onLoad = DataManager.onLoad;
        DataManager.onLoad = function (object) {
            DataManager_onLoad.call(this);
            if (object != $dataItems)
                return;
            ItemCash.cashItems = JSON.parse(ItemCash.parameters.items).map(function (itemId) {
                var item = $dataItems[Number(itemId)];
                if (!item) {
                    throw new Error("Item with id ".concat(itemId, " does not exist."));
                }
                return {
                    item: Number(itemId),
                    value: item.price,
                };
            });
            console.log("Cash items", ItemCash.cashItems);
        };
        function getMoneyValueOfItem(item) {
            var cashItem = ItemCash.cashItems.find(function (cashItem) { return cashItem.item == item.id; });
            return cashItem ? cashItem.value : null;
        }
        ItemCash.getMoneyValueOfItem = getMoneyValueOfItem;
        Game_Party.prototype.gold = function () {
            return this.items().reduce(function (sum, item) {
                var amount = $gameParty.numItems(item);
                var value = getMoneyValueOfItem(item);
                return sum + (value ? value * amount : 0);
            }, 0);
        };
    })(ItemCash = CLL.ItemCash || (CLL.ItemCash = {}));
})(CLL || (CLL = {}));
