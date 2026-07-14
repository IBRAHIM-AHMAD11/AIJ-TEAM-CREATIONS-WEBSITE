import Toolbar from "@/app/(store)/store/toolbar";

interface StoreLayoutProps {
   children: React.ReactNode;
}

const StoreLayout = ({ children }: StoreLayoutProps) => {
   return(
      <div>
         <Toolbar />
         {children}
      </div>
   )
}

export default StoreLayout;