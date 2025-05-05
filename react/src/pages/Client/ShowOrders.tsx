import { OrdersTable } from "../../components/other/OrdersTable";

export function ShowOrders() {
    return (
        <main>
            <h1>Show Orders</h1>
            <OrdersTable tableFor="client" />
        </main>
    )
}