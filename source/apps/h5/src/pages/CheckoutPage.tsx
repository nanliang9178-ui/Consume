import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { clearCart, getLines, summary } from '../lib/cart';
import { fen, yuan } from '../lib/format';
import { useShop } from '../shop';
import type { Order } from '../lib/types';

type OrderType = 'DINE_IN' | 'TAKEAWAY';

export default function CheckoutPage() {
  const { boot, scene } = useShop();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const store = boot?.store;
  const lines = getLines();

  const [type, setType] = useState<OrderType>(() => {
    const fromQuery = search.get('type');
    if (fromQuery === 'DINE_IN' && boot?.table) return 'DINE_IN';
    if (fromQuery === 'TAKEAWAY' || fromQuery === 'DELIVERY') return 'TAKEAWAY';
    return boot?.table ? 'DINE_IN' : 'TAKEAWAY';
  });
  const [remark, setRemark] = useState('');
  const [people, setPeople] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { count, amount } = summary();

  const totals = useMemo(() => {
    const threshold = store?.fullReduceThreshold || 0;
    const reduce = store?.fullReduceAmount || 0;
    const discount = threshold > 0 && amount >= threshold ? reduce : 0;
    const packing = type === 'TAKEAWAY' ? store?.packingFee || 0 : 0;
    return { discount, packing, total: Math.max(0, amount - discount + packing) };
  }, [store, amount, type]);

  const minAmount = type === 'TAKEAWAY' ? store?.minOrderAmount || 0 : 0;
  const belowMin = type === 'TAKEAWAY' && minAmount > 0 && amount < minAmount;

  const submit = async () => {
    if (submitting) return;
    if (!count) {
      setError('购物车为空，请先选择菜品');
      return;
    }
    if (store && !store.openStatus) {
      setError('门店休息中，暂不接单');
      return;
    }
    if (belowMin) {
      setError(`打包需满 ${yuan(minAmount)} 元`);
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const order = await api.post<Order>('/client/orders', {
        type,
        tableId: type === 'DINE_IN' && boot?.table ? boot.table.id : undefined,
        peopleCount: type === 'DINE_IN' ? people : undefined,
        remark: remark.trim() || undefined,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          specOptionIds: line.specOptionIds,
        })),
        idempotencyKey: `h5-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      });

      clearCart();

      const pay = await api.post<{ mock: boolean; order?: Order }>(`/client/orders/${order.id}/pay`, {});
      if (pay?.mock) {
        navigate(`/t/${scene}/result/${order.id}`, { replace: true });
        return;
      }
      navigate(`/t/${scene}/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!count && !submitting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream px-8 text-center">
        <p className="text-[13px] text-ink-500">购物车是空的</p>
        <button
          type="button"
          onClick={() => navigate(`/t/${scene}`, { replace: true })}
          className="btn-brand cursor-pointer rounded-full px-6 py-2 text-[13px] font-semibold"
        >
          去点单
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-28">
      <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-line bg-[#FBF7F2]/95 px-3 backdrop-blur">
        <button type="button" onClick={() => navigate(-1)} className="cursor-pointer text-[15px] text-ink-500">
          ‹
        </button>
        <p className="text-[14px] font-semibold">确认订单</p>
      </header>

      <div className="space-y-2.5 p-3">
        <section className="rounded-2xl bg-white p-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => boot?.table && setType('DINE_IN')}
              className={`flex-1 cursor-pointer rounded-xl border-2 py-2.5 text-center ${
                type === 'DINE_IN' ? 'border-brand bg-brand-light' : 'border-transparent bg-cream'
              } ${boot?.table ? '' : 'opacity-45'}`}
            >
              <p className={`text-[14px] font-semibold ${type === 'DINE_IN' ? 'text-brand' : 'text-ink-900'}`}>堂食</p>
              <p className="mt-0.5 text-[10.5px] text-ink-400">
                {boot?.table ? `${boot.table.area} ${boot.table.name}` : '请先扫码'}
              </p>
            </button>
            <button
              type="button"
              onClick={() => setType('TAKEAWAY')}
              className={`flex-1 cursor-pointer rounded-xl border-2 py-2.5 text-center ${
                type === 'TAKEAWAY' ? 'border-brand bg-brand-light' : 'border-transparent bg-cream'
              }`}
            >
              <p className={`text-[14px] font-semibold ${type === 'TAKEAWAY' ? 'text-brand' : 'text-ink-900'}`}>打包</p>
              <p className="mt-0.5 text-[10.5px] text-ink-400">
                {store && store.packingFee > 0 ? `打包费 ¥${fen(store.packingFee)}` : '到店自取'}
              </p>
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[13px] font-semibold">{store?.name}</p>
            <p className="text-[10.5px] text-ink-400">共 {count} 件</p>
          </div>
          {lines.map((line) => (
            <div key={line.key} className="flex items-center gap-2.5 border-b border-line/60 py-2 last:border-0">
              {line.imageUrl ? (
                <img src={line.imageUrl} alt={line.name} className="h-11 w-11 rounded-lg object-cover" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cream text-base">🍲</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium">{line.name}</p>
                {line.specText && <p className="truncate text-[10px] text-ink-400">{line.specText}</p>}
                <p className="font-num text-[12.5px] font-semibold">¥{fen(line.unitPrice * line.quantity)}</p>
              </div>
              <span className="text-[11px] text-ink-400">x{line.quantity}</span>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-white p-3">
          {type === 'DINE_IN' && (
            <div className="flex items-center justify-between border-b border-line/60 py-2">
              <span className="text-[12.5px] text-ink-500">用餐人数</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPeople((value) => Math.max(1, value - 1))}
                  className="h-6 w-6 cursor-pointer rounded-full bg-cream text-[14px] leading-none"
                >
                  −
                </button>
                <span className="w-5 text-center font-num text-[13px] font-semibold">{people}</span>
                <button
                  type="button"
                  onClick={() => setPeople((value) => Math.min(20, value + 1))}
                  className="h-6 w-6 cursor-pointer rounded-full bg-brand-light text-[14px] leading-none text-brand"
                >
                  +
                </button>
              </div>
            </div>
          )}
          <div className="pt-2">
            <p className="mb-1.5 text-[12.5px] text-ink-500">备注</p>
            <textarea
              value={remark}
              onChange={(event) => setRemark(event.target.value)}
              placeholder={type === 'TAKEAWAY' ? '如：多给一份打包盒、不要香菜' : '如：不要香菜、少辣'}
              maxLength={200}
              rows={2}
              className="w-full resize-none rounded-xl bg-[#F9F6F1] px-3 py-2 text-[12.5px] leading-relaxed outline-none placeholder:text-ink-400/60"
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-3 text-[12.5px]">
          <div className="flex justify-between py-1 text-ink-500">
            <span>商品金额</span>
            <span className="font-num">¥{fen(amount)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between py-1 text-brand">
              <span>满减优惠</span>
              <span className="font-num">-¥{fen(totals.discount)}</span>
            </div>
          )}
          {totals.packing > 0 && (
            <div className="flex justify-between py-1 text-ink-500">
              <span>打包费</span>
              <span className="font-num">¥{fen(totals.packing)}</span>
            </div>
          )}
          <div className="mt-1 flex items-baseline justify-between border-t border-line/70 pt-2">
            <span className="text-[13px] font-semibold">合计</span>
            <span className="text-brand">
              <span className="text-[11px]">¥</span>
              <span className="font-num text-[20px] font-bold">{fen(totals.total)}</span>
            </span>
          </div>
        </section>
      </div>

      {error && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[78px] z-40 flex justify-center px-8">
          <p className="rounded-full bg-red-500/95 px-4 py-2 text-[12px] text-white shadow-lg">{error}</p>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-line bg-white px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">
        <div className="flex items-baseline gap-1 text-brand">
          <span className="text-[11px]">合计 ¥</span>
          <span className="font-num text-[20px] font-bold">{fen(totals.total)}</span>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="btn-brand h-11 cursor-pointer rounded-full px-7 text-[14px] font-semibold disabled:opacity-60"
        >
          {submitting ? '提交中…' : type === 'TAKEAWAY' ? '提交打包单' : '提交并支付'}
        </button>
      </div>
    </div>
  );
}
