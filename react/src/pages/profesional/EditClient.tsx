import { useContext } from "react"
import { ProfessionalContext } from "../../contexts/ProfessionalContext";

export function EditClient () {
    
    const client = useContext(ProfessionalContext)?.getClient();
    
    return (
        <form>
            <label htmlFor="dni">DNI</label>
            <input type="text" id='dni' value={client?.dni} disabled />
            <label htmlFor="name">Name</label>
            <input type="text" id='name' value={client?.name} />
            <label htmlFor="email">Email</label>
            <input type="text" id="email" value={client?.email} />
            <label htmlFor="phone">Phone</label>
            <input type="text" id="phone" value={client?.phone} />
            <button>Modify</button>
        </form>
    )
}