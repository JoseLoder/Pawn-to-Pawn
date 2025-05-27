import { useQuery } from "@tanstack/react-query";
import { getAllMachines } from "../../api/machines.api";
import { BackEndError } from "../../errors/BackEndError";
import { MachinesTable } from "../../components/tables/MachinesTable";
import { CreateMachine } from "../../components/creates/CreateMachine";

export function Machines() {
    const {
        data: machines,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["machines"],
        queryFn: getAllMachines,
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
                        <h3>Machines table</h3>
                        <p>Result {machines?.data?.length ?? 0} machines</p>
                        <MachinesTable machines={machines?.data || []} />
                    </article>
                    <article>
                        <h3>Create Machines</h3>
                        <CreateMachine />

                    </article>
                </section>
            )}
        </>

    )
}