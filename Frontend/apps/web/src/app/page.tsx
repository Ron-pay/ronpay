"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMiniPayWallet } from "@/hooks/useMiniPayWallet";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Zap,
  CalendarClock,
  Phone,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const DEMO_MESSAGES = [
  { from: "user", text: "Buy ₦500 MTN airtime for 08142293610" },
  {
    from: "agent",
    text: "Got it! ₦500 MTN airtime for 08142293610 costs 0.34 USDm. Confirm to sign.",
  },
  { from: "user", text: "Schedule ₦200 airtime every Monday for my mum" },
  {
    from: "agent",
    text: "✅ Recurring task set — ₦200 Airtel airtime every Monday at 8am. I'll handle it automatically.",
  },
  { from: "user", text: "What's my USDm balance?" },
  { from: "agent", text: "Your balance: 12.45 USDm · 0.002 CELO" },
];

export default function LandingPage() {
  const { isMiniPay } = useMiniPayWallet();
  const router = useRouter();
  const [visibleCount, setVisibleCount] = React.useState(1);

  React.useEffect(() => {
    if (isMiniPay) router.replace("/app");
  }, [isMiniPay, router]);

  // Animate chat messages appearing one by one
  React.useEffect(() => {
    if (visibleCount >= DEMO_MESSAGES.length) return;
    const t = setTimeout(
      () => setVisibleCount((c) => c + 1),
      visibleCount === 0 ? 600 : 1400,
    );
    return () => clearTimeout(t);
  }, [visibleCount]);

  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-yellow-50/90 backdrop-blur border-b border-yellow-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo1.png" alt="RonPay" width={32} height={32} />
            <span className="font-bold text-xl">RonPay</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Features
            </a>
            <a
              href="#buy-airtime"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Buy Airtime
            </a>
            <Link
              href="/app"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors hidden sm:block"
            >
              MiniPay App
            </Link>
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-yellow-100 via-yellow-50 to-yellow-50 pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-200 border border-yellow-300 rounded-full px-4 py-1.5 text-sm text-yellow-800 mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered · Built on Celo
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-5">
              Your AI agent for{" "}
              <span className="text-yellow-500">payments & airtime</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-4">
              Just chat. RonPay&apos;s AI understands what you want — buy
              airtime, send money, or schedule recurring top-ups — and handles
              it on the Celo blockchain in seconds.
            </p>

            {/* Capability pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { icon: "📱", label: "Buy airtime instantly" },
                { icon: "🔁", label: "Schedule recurring tasks" },
                { icon: "💸", label: "Send stablecoins" },
                { icon: "💬", label: "Chat in plain language" },
              ].map((p) => (
                <span
                  key={p.label}
                  className="flex items-center gap-1.5 bg-yellow-100 border border-yellow-200 text-yellow-800 text-sm px-3 py-1.5 rounded-full"
                >
                  {p.icon} {p.label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/app"
                className="flex items-center gap-2 px-7 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl transition-colors"
              >
                Chat with Agent <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#buy-airtime"
                className="px-7 py-3 border border-yellow-300 hover:border-yellow-500 bg-yellow-100 hover:bg-yellow-200 text-gray-800 font-semibold rounded-xl transition-colors"
              >
                Buy Airtime
              </a>
            </div>
          </div>

          {/* Right: animated chat demo */}
          <div className="relative">
            <div className="bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-w-sm mx-auto">
              {/* Phone chrome */}
              <div className="bg-gray-800 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-400 text-center">
                  ronpay.xyz/app
                </div>
              </div>

              {/* Chat area */}
              <div className="bg-gray-50 px-4 py-4 space-y-3 min-h-[320px]">
                {/* Agent avatar header */}
                <div className="flex items-center gap-2 mb-2">
                  <Image
                    src="/ronpay-agent-avatar.png"
                    alt="Agent"
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    RonPay Agent
                  </span>
                  <span className="w-2 h-2 rounded-full bg-green-400 ml-auto" />
                </div>

                {DEMO_MESSAGES.slice(0, visibleCount).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-snug ${
                        msg.from === "user"
                          ? "bg-yellow-400 text-gray-900 rounded-tr-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {visibleCount < DEMO_MESSAGES.length &&
                  DEMO_MESSAGES[visibleCount].from === "agent" && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm flex gap-1 items-center">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  )}
              </div>

              {/* Input bar */}
              <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-400">
                  Ask me anything...
                </div>
                <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-gray-900" />
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-4 top-16 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs font-medium text-gray-700 hidden lg:flex items-center gap-2">
              <span className="text-green-500">✓</span> Airtime delivered
            </div>
            <div className="absolute -right-4 bottom-20 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs font-medium text-gray-700 hidden lg:flex items-center gap-2">
              <CalendarClock className="h-3.5 w-3.5 text-yellow-500" /> Task
              scheduled
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 px-6 bg-yellow-50/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">What the agent can do</h2>
            <p className="text-gray-500">
              Tell it what you need. It figures out the rest.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Phone className="h-6 w-6 text-yellow-500" />,
                title: "Buy Airtime & Data",
                desc: 'Say "Buy ₦1000 MTN airtime for 08142293610" and it\'s done. Auto-detects the network from the number.',
                example: '"Top up 500 Naira Airtel for my sister"',
              },
              {
                icon: <CalendarClock className="h-6 w-6 text-yellow-500" />,
                title: "Schedule Recurring Tasks",
                desc: "Set up automatic weekly or monthly airtime top-ups. The agent runs them for you without reminders.",
                example: '"Send ₦200 airtime every Friday at 9am"',
              },
              {
                icon: <Zap className="h-6 w-6 text-yellow-500" />,
                title: "Instant Transfers",
                desc: "Send USDm, NGNm, KESm and more to any Celo address or phone number. Real-time Mento exchange rates.",
                example: '"Send 10 USDm to 0x1234...abcd"',
              },
              {
                icon: <MessageCircle className="h-6 w-6 text-yellow-500" />,
                title: "Multilingual Chat",
                desc: "Speak in English, French, Spanish, or Portuguese. The agent understands and responds in your language.",
                example: '"Achète 500 NGN de crédit MTN"',
              },
              {
                icon: <span className="text-2xl">💰</span>,
                title: "Balance Checks",
                desc: 'Ask "What\'s my balance?" and get a live breakdown of all your Celo tokens in one message.',
                example: '"Show me my USDm and NGNm balance"',
              },
              {
                icon: <span className="text-2xl">🔒</span>,
                title: "Non-Custodial",
                desc: "The agent prepares transactions but you always sign. Your keys stay in your wallet — always.",
                example: "You sign. We never touch your funds.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-yellow-50 rounded-2xl p-6 border border-yellow-100 hover:border-yellow-300 hover:shadow-sm transition-all"
              >
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-3">
                  {f.desc}
                </p>
                <div className="bg-yellow-100 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-700 italic">
                  {f.example}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Buy Airtime ── */}
      <section id="buy-airtime" className="py-20 px-6 bg-yellow-100/70">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-yellow-200 border border-yellow-300 rounded-full px-4 py-1.5 text-sm text-yellow-800 mb-4">
              <Phone className="h-3.5 w-3.5" /> Instant top-up
            </span>
            <h2 className="text-3xl font-bold mb-3">Buy Airtime</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Top up any Nigerian number in seconds. Pay with USDm stablecoins —
              no bank, no card needed.
            </p>
          </div>

          {/* Network badges */}
          <div className="flex justify-center gap-3 flex-wrap mb-10">
            {[
              { name: "MTN", color: "bg-yellow-400", text: "text-gray-900" },
              { name: "Airtel", color: "bg-red-500", text: "text-white" },
              { name: "Glo", color: "bg-green-600", text: "text-white" },
              {
                name: "9mobile",
                color: "bg-emerald-400",
                text: "text-gray-900",
              },
            ].map((n) => (
              <span
                key={n.name}
                className={`${n.color} ${n.text} text-sm font-semibold px-5 py-2 rounded-full shadow-sm`}
              >
                {n.name}
              </span>
            ))}
          </div>

          {/* Form card — centered */}
          <div className="max-w-md mx-auto">
            <AirtimeFormInline />
          </div>

          {/* Trust line */}
          <p className="text-center text-xs text-yellow-700 mt-6 flex items-center justify-center gap-4">
            <span>🔒 Non-custodial — you sign every transaction</span>
            <span>⚡ Delivery under 60 seconds</span>
            <span>🌍 Powered by Celo</span>
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gray-900 py-20 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to try the AI agent?</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Open the app, connect your wallet, and just type what you need. No
          tutorials required.
        </p>
        <Link
          href="/app"
          className="inline-flex items-center gap-2 px-10 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          Open AI Agent
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-yellow-200 bg-yellow-50 py-6 text-center text-sm text-yellow-700">
        Built with ❤️ for the Celo Ecosystem ·{" "}
        <Link href="/app" className="underline hover:text-gray-600">
          MiniPay App
        </Link>
      </footer>
    </div>
  );
}

// ── Inline airtime form (no separate file needed) ──────────────────────────
import { useAccount } from "wagmi";
import { useSendTransaction } from "wagmi";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";

const NETWORKS = ["Auto", "MTN", "Airtel", "Glo", "9mobile"] as const;
type Network = (typeof NETWORKS)[number];
const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

type FormStatus =
  | { type: "idle" }
  | { type: "loading"; msg: string }
  | { type: "success"; txHash: string; amount: number; phone: string }
  | { type: "error"; msg: string };

function AirtimeFormInline() {
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const [phone, setPhone] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [network, setNetwork] = React.useState<Network>("Auto");
  const [status, setStatus] = React.useState<FormStatus>({ type: "idle" });
  const [usdmEstimate, setUsdmEstimate] = React.useState<string | null>(null);

  const busy = status.type === "loading";

  // Rough live estimate: 1 USDm ≈ ₦1500 (shown as a hint, not a guarantee)
  React.useEffect(() => {
    const amt = parseFloat(amount);
    if (amt >= 50) {
      setUsdmEstimate((amt / 1500).toFixed(4));
    } else {
      setUsdmEstimate(null);
    }
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    const cleaned = phone.replace(/\D/g, "");
    if (
      !(
        (cleaned.length === 11 && cleaned.startsWith("0")) ||
        (cleaned.length === 13 && cleaned.startsWith("234"))
      )
    ) {
      setStatus({
        type: "error",
        msg: "Enter a valid Nigerian number e.g. 08012345678",
      });
      return;
    }

    const amt = parseFloat(amount);
    if (!amt || amt < 50) {
      setStatus({ type: "error", msg: "Minimum amount is ₦50" });
      return;
    }

    setStatus({ type: "loading", msg: "Preparing transaction..." });

    try {
      const res = await api.parseIntentDirect(
        {
          action: "buy_airtime",
          recipient: phone,
          amount: amt,
          currency: "NGN",
          biller: network === "Auto" ? undefined : network,
          confidence: 1.0,
        },
        address,
      );

      setStatus({ type: "loading", msg: "Waiting for wallet signature..." });

      sendTransaction(
        {
          to: res.transaction.to as `0x${string}`,
          value: BigInt(res.transaction.value),
          data: res.transaction.data,
        },
        {
          onSuccess: async (hash) => {
            setStatus({ type: "loading", msg: "Processing airtime..." });
            const meta = res.meta;
            try {
              await api.executePayment({
                fromAddress: address,
                toAddress: res.transaction.to,
                amount: res.parsedCommand.amount,
                currency: "USDm",
                txHash: hash,
                intent: "buy_airtime",
                memo: `Airtime ${amt} NGN to ${phone}`,
                type: "bill_payment",
                metadata: meta,
              });
              try {
                await api.purchaseAirtime({
                  txHash: hash,
                  phoneNumber: phone,
                  amount: meta?.originalAmountNgn || amt,
                  provider:
                    meta?.detectedNetwork === "AUTO_DETECT"
                      ? undefined
                      : meta?.detectedNetwork ||
                        (network === "Auto" ? undefined : network),
                  walletAddress: address,
                });
              } catch {
                // auto-trigger handles it
              }
            } catch {
              // tx went through, airtime still delivers
            }
            setStatus({ type: "success", txHash: hash, amount: amt, phone });
            setPhone("");
            setAmount("");
          },
          onError: (err) =>
            setStatus({
              type: "error",
              msg: err.message || "Transaction rejected",
            }),
        },
      );
    } catch (err) {
      setStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  if (status.type === "success") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center shadow-sm">
        <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-xl mb-1">Airtime Sent!</h3>
        <p className="text-gray-500 text-sm mb-4">
          ₦{status.amount.toLocaleString()} airtime to {status.phone}
        </p>
        <a
          href={`https://celoscan.io/tx/${status.txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline block mb-5"
        >
          View on Celoscan ↗
        </a>
        <button
          onClick={() => setStatus({ type: "idle" })}
          className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-xl"
        >
          Buy More
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="text-4xl mb-3">👛</div>
        <h3 className="font-semibold text-lg mb-2">Connect your wallet</h3>
        <p className="text-gray-500 text-sm mb-5">
          Use MetaMask, Valora, or any Celo wallet.
        </p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-yellow-200 shadow-md p-6">
      {/* Card header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Top Up Airtime</h3>
          <p className="text-xs text-gray-400 mt-0.5">Pay with USDm on Celo</p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-green-700 font-medium">Live</span>
        </div>
      </div>

      {/* Wallet badge */}
      <div className="flex items-center justify-between mb-5 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
        <span className="text-xs text-gray-500">Connected wallet</span>
        <span className="font-mono text-sm text-gray-800">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Network */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Network
          </label>
          <div className="grid grid-cols-5 gap-2">
            {NETWORKS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNetwork(n)}
                disabled={busy}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  network === n
                    ? "bg-yellow-400 text-gray-900 shadow"
                    : "bg-yellow-50 border border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                } disabled:opacity-50`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08012345678"
            disabled={busy}
            required
            className="w-full px-4 py-3 border border-yellow-200 bg-yellow-50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none placeholder-gray-400"
          />
        </div>

        {/* Amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount (₦)
            </label>
            {usdmEstimate && (
              <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                ≈ {usdmEstimate} USDm
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAmount(String(a))}
                disabled={busy}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  amount === String(a)
                    ? "bg-yellow-400 text-gray-900 shadow"
                    : "bg-yellow-50 border border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                } disabled:opacity-50`}
              >
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Or enter custom amount"
            min="50"
            disabled={busy}
            required
            className="w-full px-4 py-3 border border-yellow-200 bg-yellow-50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none placeholder-gray-400"
          />
        </div>

        {/* Status */}
        {(status.type === "loading" || status.type === "error") && (
          <div
            className={`p-3 rounded-xl flex items-start gap-2 text-sm ${
              status.type === "error"
                ? "bg-red-50 text-red-700 border border-red-100"
                : "bg-blue-50 text-blue-700 border border-blue-100"
            }`}
          >
            {status.type === "error" ? (
              <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            ) : (
              <Loader2 className="h-4 w-4 mt-0.5 flex-shrink-0 animate-spin" />
            )}
            <span>{status.type === "error" ? status.msg : status.msg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
        >
          {busy ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Phone className="h-5 w-5" />
              {`Buy ${
                amount ? `₦${Number(amount).toLocaleString()}` : "Airtime"
              }`}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
