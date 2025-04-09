import { FileExplorer, Header } from "../../components";
import "./index.scss";

export default function Home() {
  return (
    <div className="home">
      <Header />
      <FileExplorer />
    </div>
  )
}
