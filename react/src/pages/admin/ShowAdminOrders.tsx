import { OrdersTable } from "../../components/tables/OrdersTable";


export function ShowAdminOrders() {

return (
    <main>
        <h1>Show Orders</h1>
        <OrdersTable tableFor="admin" />
    </main>
)
}