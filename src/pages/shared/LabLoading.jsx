import { Ripple } from "@/components/ui/ripple";
import logo from "@/assets/logo.png";
import './LabLoading.css';

export default function LabLoading() {
  return (
    <div className="lab-loading">

      <div className="lab-ripple">
        <Ripple />
      </div>

      <img src={logo} className="lab-logo" alt="GreenShield loading" />

    </div>
  );
}
