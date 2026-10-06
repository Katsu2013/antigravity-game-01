/**
 * @file Pathfinding.ts
 * @description A*（A-Star）探索アルゴリズムによる、グリッドマップ上の最短経路計算クラス。
 * 壁および他のモンスターを障害物として回避しながら、目標地点への次の1歩を導出します。
 */

import { DungeonMap, Point, TileType } from '../types';

/**
 * A* 探索のオープンリスト/クローズドリスト用ノード情報インターフェース。
 */
export interface PathNode {
  /**
   * グリッドX座標。
   * - 想定値: 0以上の整数
   */
  x: number;
  /**
   * グリッドY座標。
   * - 想定値: 0以上の整数
   */
  y: number;
  /**
   * スタート地点からこのノードまでの移動コスト実測値 (g)。
   * - 想定値: 0以上の数値
   */
  g: number;
  /**
   * このノードからゴールまでの推定コスト・ヒューリスティック (h)。
   * - 想定値: 0以上の数値（チェビシェフまたはマンハッタン距離）
   */
  h: number;
  /**
   * 総合評価スコア (f = g + h)。
   * - 想定値: 0以上の数値
   */
  f: number;
  /**
   * 経路復元用の親ノード参照。
   * - 想定値: 直前の PathNode インスタンスまたはスタート時 `null`
   */
  parent: PathNode | null;
}

/**
 * 経路探索処理を担当する静的ユーティリティクラス。
 */
export class Pathfinding {
  /**
   * スタート地点からゴール地点へ向かうための、直近の次の移動先座標（1マス分）をA*アルゴリズムで探索します。
   *
   * @param map - ダンジョンマップデータ（壁判定に使用）
   * @param start - 探索開始座標（モンスターの現在位置）
   * @param goal - 目標座標（プレイヤーの現在位置）
   * @param occupiedPositions - 他のモンスターが占有している通行不能マスのリスト
   * @returns 次に移動すべき隣接マス座標。経路が存在しない場合や既に隣接している場合は null
   */
  public static getNextStep(
    map: DungeonMap,
    start: Point,
    goal: Point,
    occupiedPositions: Point[] = []
  ): Point | null {
    // 既にゴールに隣接している（距離1以内）場合は次のステップを計算せず直接攻撃可能
    const dist = Math.max(Math.abs(start.x - goal.x), Math.abs(start.y - goal.y));
    if (dist <= 1) {
      return null;
    }

    const openList: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    /** 座標を一意な文字列キーに変換するヘルパー関数 */
    const toKey = (x: number, y: number): string => `${x},${y}`;

    // 他のモンスターがいるマスを障害物セットに追加（ただしゴールマス＝プレイヤーは除外）
    const blockerSet: Set<string> = new Set();
    for (const pos of occupiedPositions) {
      if (pos.x !== goal.x || pos.y !== goal.y) {
        blockerSet.add(toKey(pos.x, pos.y));
      }
    }

    const startNode: PathNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: Math.hypot(start.x - goal.x, start.y - goal.y),
      f: Math.hypot(start.x - goal.x, start.y - goal.y),
      parent: null,
    };

    openList.push(startNode);

    // 8方向の移動オフセット（上下左右＋斜め）
    const directions: Point[] = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: -1, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: 1 },
    ];

    let maxSteps = 150; // 計算負荷制限用のステップ上限

    while (openList.length > 0 && maxSteps-- > 0) {
      // f値が最小のノードを取り出す
      let lowestIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[lowestIndex].f) {
          lowestIndex = i;
        }
      }
      const current = openList.splice(lowestIndex, 1)[0];
      const currentKey = toKey(current.x, current.y);
      closedSet.add(currentKey);

      // ゴールに到達した場合、親を遡って「スタート直後の最初の1歩」を特定
      if (current.x === goal.x && current.y === goal.y) {
        let curr: PathNode = current;
        while (curr.parent && curr.parent.parent) {
          curr = curr.parent;
        }
        return { x: curr.x, y: curr.y };
      }

      // 隣接8マスを探索
      for (const dir of directions) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        const nKey = toKey(nx, ny);

        // 範囲外チェック
        if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) {
          continue;
        }

        // 壁または水路または占有中マスまたはクローズド済みならスキップ
        if (
          map.tiles[ny][nx] === TileType.Wall ||
          map.tiles[ny][nx] === TileType.Water ||
          blockerSet.has(nKey) ||
          closedSet.has(nKey)
        ) {
          continue;
        }

        // 斜め移動時の角抜け防止（角の壁や水路をすり抜けない）
        if (dir.x !== 0 && dir.y !== 0) {
          const isBlocked1 =
            map.tiles[current.y][nx] === TileType.Wall ||
            map.tiles[current.y][nx] === TileType.Water;
          const isBlocked2 =
            map.tiles[ny][current.x] === TileType.Wall ||
            map.tiles[ny][current.x] === TileType.Water;
          if (isBlocked1 && isBlocked2) {
            continue;
          }
        }

        const moveCost = dir.x !== 0 && dir.y !== 0 ? 1.414 : 1.0;
        const gScore = current.g + moveCost;

        let neighbor = openList.find((n) => n.x === nx && n.y === ny);

        if (!neighbor) {
          const hScore = Math.hypot(nx - goal.x, ny - goal.y);
          neighbor = {
            x: nx,
            y: ny,
            g: gScore,
            h: hScore,
            f: gScore + hScore,
            parent: current,
          };
          openList.push(neighbor);
        } else if (gScore < neighbor.g) {
          neighbor.g = gScore;
          neighbor.f = gScore + neighbor.h;
          neighbor.parent = current;
        }
      }
    }

    return null;
  }
}
