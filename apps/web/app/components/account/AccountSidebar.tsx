import { Link, useLocation } from "@remix-run/react";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  LogOut, 
  LayoutDashboard 
} from "lucide-react";
import { cn } from "~/lib/utils";

interface SidebarItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

function SidebarItem({ href, icon: Icon, label, isActive }: SidebarItemProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function AccountSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const items = [
    {
      href: "/account",
      icon: LayoutDashboard,
      label: "Dashboard",
      exact: true,
    },
    {
      href: "/account/orders",
      icon: ShoppingBag,
      label: "Orders",
    },
    {
      href: "/account/profile",
      icon: User,
      label: "Profile",
    },
    {
      href: "/account/addresses",
      icon: MapPin,
      label: "Addresses",
    },
  ];

  return (
    <div className="flex flex-col gap-1">
      <div className="px-4 py-2 mb-2">
        <h2 className="text-lg font-semibold tracking-tight">My Account</h2>
        <p className="text-sm text-muted-foreground">Manage your account and orders</p>
      </div>
      
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = item.exact 
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive}
            />
          );
        })}

        <div className="pt-4 mt-4 border-t">
          <form action="/store/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}
