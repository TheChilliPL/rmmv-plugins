namespace CLL.ItemCash {
  function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
  }

  export interface CashItem {
    name: string;
    item: number;
    value: number;
  }

  export const enum ChangeAlgorithm {
    Greedy = "greedy",
  }

  export const parameters = PluginManager.parameters("CLL_ItemCash");
  export let cashItems: CashItem[] = [];
  export let changeAlgorithm = ChangeAlgorithm.Greedy;

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
        name: item.name,
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

  export function findChangeGreedy(
    money: number
  ): { item: CashItem; amount: number }[] {
    const sortedCashItems = cashItems.sort((a, b) => b.value - a.value);
    const change: { item: CashItem; amount: number }[] = [];

    for (const cashItem of sortedCashItems) {
      const amount = Math.floor(money / cashItem.value);
      if (amount > 0) {
        change.push({ item: cashItem, amount });
        money -= amount * cashItem.value;
      }
    }

    return change;
  }

  export function findChange(
    money: number
  ): { item: CashItem; amount: number }[] {
    switch (changeAlgorithm) {
      case ChangeAlgorithm.Greedy:
        return findChangeGreedy(money);
      default:
        assertNever(changeAlgorithm);
    }
  }
}
