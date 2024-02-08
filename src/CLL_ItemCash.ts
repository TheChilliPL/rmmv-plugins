/*:
 * @plugindesc Use items as money!
 * @author TheChilliPL
 *
 * @param items
 * @text Items
 * @desc List of items that can be used as money. The cost of the item will be used as its value.
 * @type item[]
 */

namespace CLL.ItemCash {
  interface CashItem {
    item: number;
    value: number;
  }

  export const parameters = PluginManager.parameters("CLL_ItemCash");
  export let cashItems: CashItem[] = [];

  let DataManager_onLoad = DataManager.onLoad;
  DataManager.onLoad = function (object: object | object[]) {
    DataManager_onLoad.call(this);

    if (object != $dataItems) return;
    cashItems = (JSON.parse(parameters.items) as string[]).map((itemId) => {
      const item = $dataItems[Number(itemId)];
      if (!item) {
        throw new Error(`Item with id ${itemId} does not exist.`);
      }
      return {
        item: Number(itemId),
        value: item.price,
      };
    });

    console.log("Cash items", cashItems);
  };

  export function getMoneyValueOfItem(item: Data_Item): Maybe<number> {
    const cashItem = cashItems.find((cashItem) => cashItem.item == item.id);
    return cashItem ? cashItem.value : null;
  }

  Game_Party.prototype.gold = function () {
    return this.items().reduce((sum, item) => {
      const amount = $gameParty.numItems(item);
      const value = getMoneyValueOfItem(item);
      return sum + (value ? value * amount : 0);
    }, 0);
  };
}
