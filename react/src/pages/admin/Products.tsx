import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../api/products.api";
import { BackEndError } from "../../errors/BackEndError";
import { ProductsTable } from "../../components/tables/ProductsTable";
import { CreateProduct } from "../../components/creates/CreateProduct";
import { ProductReturn } from "../../../../shared/types/products.types";

export function Products() {
    const {
        data: products,
        isLoading,
        isError,
        error,
    } = useQuery<ProductReturn[]>({
        queryKey: ["products"],
        queryFn: async () => {
            const response = await getProducts();
            return response.data;
        },
        retry: false
    });

    return (
        <>
            {isLoading ? (
                <div>Loading...</div>
            ) : isError ? (
                <BackEndError inputError={error} />
            ) : (
                <section>
                    <article>
                        <h3>Products table</h3>
                        <p>Result {products?.length ?? 0} products</p>
                        <ProductsTable products={products || []} />
                    </article>
                    <article>
                        <h3>Create Products</h3>
                        <CreateProduct />

                    </article>
                </section>
            )}
        </>

    )
}
