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
        function assertNever(x) {
            throw new Error("Unexpected object: " + x);
        }
        ItemCash.parameters = PluginManager.parameters("CLL_ItemCash");
        ItemCash.cashItems = [];
        ItemCash.changeAlgorithm = "greedy" /* ChangeAlgorithm.Greedy */;
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
                    name: item.name,
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
        function findChangeGreedy(money) {
            var sortedCashItems = ItemCash.cashItems.sort(function (a, b) { return b.value - a.value; });
            var change = [];
            for (var _i = 0, sortedCashItems_1 = sortedCashItems; _i < sortedCashItems_1.length; _i++) {
                var cashItem = sortedCashItems_1[_i];
                var amount = Math.floor(money / cashItem.value);
                if (amount > 0) {
                    change.push({ item: cashItem, amount: amount });
                    money -= amount * cashItem.value;
                }
            }
            return change;
        }
        ItemCash.findChangeGreedy = findChangeGreedy;
        function findChange(money) {
            switch (ItemCash.changeAlgorithm) {
                case "greedy" /* ChangeAlgorithm.Greedy */:
                    return findChangeGreedy(money);
                default:
                    assertNever(ItemCash.changeAlgorithm);
            }
        }
        ItemCash.findChange = findChange;
    })(ItemCash = CLL.ItemCash || (CLL.ItemCash = {}));
})(CLL || (CLL = {}));
