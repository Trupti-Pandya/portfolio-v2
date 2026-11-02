import ChatWidget from "@/components/ChatWidget";
import { PORTRAIT_ALT } from "@/components/HeroPortrait";
import RefinedSignal, { LiveChatFrame } from "@/components/refined-signal/RefinedSignal";

export default function Home() {
  return (
    <RefinedSignal
      chat={
        <LiveChatFrame>
          <ChatWidget portraitAlt={PORTRAIT_ALT} />
        </LiveChatFrame>
      }
    />
  );
}
