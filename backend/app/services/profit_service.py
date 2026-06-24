"""
利润预测计算服务

核心公式：
  平台佣金金额 = 售价 × 佣金率
  总成本 = 商品成本 + 运费 + 广告费 + 平台佣金
  毛利润 = 售价 - 总成本
  利润率 = (毛利润 / 售价) × 100%
  ROI = (毛利润 / 总成本) × 100%
  盈亏平衡售价 = (商品成本 + 运费 + 广告费) / (1 - 佣金率)
  建议售价 = (商品成本 + 运费 + 广告费) / (1 - 佣金率 - 目标利润率)
"""

from dataclasses import dataclass


@dataclass
class ProfitInput:
    """利润计算输入参数"""

    product_cost: float       # 商品成本
    shipping: float           # 运费
    commission_rate: float    # 平台佣金率（0-1，如 0.15 表示 15%）
    advertising_cost: float   # 广告费用
    selling_price: float      # 售价


@dataclass
class ProfitResult:
    """利润计算结果"""

    # 输入回显
    product_cost: float
    shipping: float
    commission_rate: float
    advertising_cost: float
    selling_price: float

    # 中间计算
    commission_amount: float     # 平台佣金金额
    total_cost: float            # 总成本
    gross_profit: float          # 毛利润

    # 核心指标
    profit_margin: float         # 利润率（%）
    roi: float                   # 投资回报率（%）

    # 分析
    break_even_price: float      # 盈亏平衡售价
    suggested_price_20: float    # 建议售价（目标利润率 20%）
    suggested_price_30: float    # 建议售价（目标利润率 30%）
    suggested_price_40: float    # 建议售价（目标利润率 40%）

    # 等级评定
    profit_level: str = "一般"   # 优秀 / 良好 / 一般 / 亏损
    roi_level: str = "一般"      # 优秀 / 良好 / 一般 / 亏损
    is_profitable: bool = True   # 是否盈利


class ProfitCalculator:
    """利润计算引擎"""

    def calculate(self, input_data: ProfitInput) -> ProfitResult:
        """
        根据输入参数计算利润相关指标
        """
        # ========== 中间计算 ==========
        commission_amount = input_data.selling_price * input_data.commission_rate
        base_cost = input_data.product_cost + input_data.shipping + input_data.advertising_cost
        total_cost = base_cost + commission_amount
        gross_profit = input_data.selling_price - total_cost

        # ========== 核心指标 ==========
        profit_margin = (gross_profit / input_data.selling_price * 100) if input_data.selling_price > 0 else 0
        roi = (gross_profit / total_cost * 100) if total_cost > 0 else 0

        # ========== 盈亏平衡售价 ==========
        # 公式：利润为 0 时的售价
        # selling_price × (1 - commission_rate) = base_cost
        # selling_price = base_cost / (1 - commission_rate)
        if input_data.commission_rate < 1:
            break_even_price = base_cost / (1 - input_data.commission_rate)
        else:
            break_even_price = float("inf")

        # ========== 建议售价（基于目标利润率） ==========
        # 公式：selling_price × (1 - commission_rate - target_margin) = base_cost
        # selling_price = base_cost / (1 - commission_rate - target_margin)
        def calc_suggested_price(target_margin: float) -> float:
            denominator = 1 - input_data.commission_rate - target_margin
            if denominator <= 0:
                return float("inf")
            return round(base_cost / denominator, 2)

        suggested_20 = calc_suggested_price(0.20)
        suggested_30 = calc_suggested_price(0.30)
        suggested_40 = calc_suggested_price(0.40)

        # ========== 等级评定 ==========
        profit_level = self._evaluate_profit_margin(profit_margin)
        roi_level = self._evaluate_roi(roi)
        is_profitable = gross_profit > 0

        return ProfitResult(
            product_cost=input_data.product_cost,
            shipping=input_data.shipping,
            commission_rate=input_data.commission_rate,
            advertising_cost=input_data.advertising_cost,
            selling_price=input_data.selling_price,
            commission_amount=round(commission_amount, 2),
            total_cost=round(total_cost, 2),
            gross_profit=round(gross_profit, 2),
            profit_margin=round(profit_margin, 2),
            roi=round(roi, 2),
            break_even_price=round(break_even_price, 2) if break_even_price != float("inf") else 0,
            suggested_price_20=suggested_20 if suggested_20 != float("inf") else 0,
            suggested_price_30=suggested_30 if suggested_30 != float("inf") else 0,
            suggested_price_40=suggested_40 if suggested_40 != float("inf") else 0,
            profit_level=profit_level,
            roi_level=roi_level,
            is_profitable=is_profitable,
        )

    @staticmethod
    def _evaluate_profit_margin(margin: float) -> str:
        """评定利润率等级"""
        if margin >= 35:
            return "优秀"
        elif margin >= 20:
            return "良好"
        elif margin > 0:
            return "一般"
        else:
            return "亏损"

    @staticmethod
    def _evaluate_roi(roi: float) -> str:
        """评定 ROI 等级"""
        if roi >= 60:
            return "优秀"
        elif roi >= 25:
            return "良好"
        elif roi > 0:
            return "一般"
        else:
            return "亏损"


# 全局计算器单例
profit_calculator = ProfitCalculator()
