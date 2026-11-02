import ChatWidget from "@/components/ChatWidget";
import RefinedSignal, { LiveChatFrame } from "@/components/refined-signal/RefinedSignal";

export default function Home() {
  return (
    <RefinedSignal
      chat={
        <LiveChatFrame>
          <ChatWidget />
        </LiveChatFrame>
      }
    />
  );
}
