import { useQuery } from "@tanstack/react-query";
import { getAllMaterials } from "../../api/materials.api";
import { BackEndError } from "../../errors/BackEndError";
import { MaterialsTable } from "../../components/tables/MaterialsTable";
import { CreateMaterial } from "../../components/creates/CreateMaterial";

export function Materials() {
  const {
    data: materials,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["materials"],
    queryFn: getAllMaterials,
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
            <h3>Materials table</h3>
            <div>Result {materials?.data?.length ?? 0} materials</div>
            <MaterialsTable materials={materials?.data || []} />
          </article>
          <article>
            <h3>Create Materials</h3>
            <CreateMaterial />
          </article>
        </section>
      )}
    </>
  )
}