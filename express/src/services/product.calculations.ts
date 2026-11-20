import { Machine, Material, Product } from "@pawn-to-pawn/shared";
import { ClientError } from "../errors/client.error";

export type ProductCalculationInput = {
    material: Material  // weight: g/m, price: €/m
    machine: Machine    // max_widht: mm, max_weight: g, max_velocity: g/min, price: €/kg
    length: number      // m
    widht: number       // mm
}


export type ProductCalculation = Pick<Product, 'estimated_weight' | 'estimated_time' | 'price'>

export const calculateProduct = (
    { material, machine, length, widht }: ProductCalculationInput
): ProductCalculation => {

    // get lenght(meters) * Material.weight(g) = estimated_weight(g)
    // Example: 40m * 500g = 20000g
    const estimated_weight = material.weight * length

    // check weight(g) < Machine.Max_weight(g)
    if (estimated_weight > machine.max_weight) {
    throw new ClientError(`
        This machine is too small for that product, 
        choose another machine that supports MORE WEIGHT,
        OR REDUCE THE LENGTH of the product.
   `)
    }
    // check widht(mm) < Machine.Max_widht(mm)
    if (widht > machine.max_widht)
    throw new ClientError(`
        This machine is too narrow for that product, 
        choose another WIDER MACHINE, 
        OR REDUCE THE WIDTH of the product.
    `)
    // get (weight(g) / Machine.Max_velocity(g/minutes)) = estimated_time(minutes)
    // Example: 20000g / 1000g = 20 minutes(per product)
    const estimated_time = estimated_weight / machine.max_velocity

    // Calculate price Material, lenght(meters) * Material.Price(euros). (Calculated by the transportation of the material, its cost, handling and benefits)
    // Example: 40(m) * 1.5(euros) = 60(euros)
    const priceMaterial = length * material.price

    // Calculate price machine, estimated_weight * Machine.Price(euros). (Calculated by the maintenance of the machine and the personnel working on it and benefits)
    // Example: 20000(g) * 1.5(euros) = 30000(euros) / 1000 = 30(euros)
    const priceMachine = (estimated_weight * machine.price) / 1000

    // Total Price, priceMaterial + PriceMachine
    // Example:  60(euros) + 30(euros) = 90 euros(per product)
    const price = priceMaterial + priceMachine

    return {estimated_weight, estimated_time, price}
}