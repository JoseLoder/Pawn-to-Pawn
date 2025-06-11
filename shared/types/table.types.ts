// Tipos específicos del frontend
export type Columns = {
    id?: string;
    path: string;
    name: string;
};

export type Items = {
    id: string;
    [key: string]: any;
};

export type Actions = {
    name: string;
    action: (id: string) => void;
    icon?: string;
    disabled?: (item: Items) => boolean;
}

export type TableFor = 'client' | 'operator' | 'admin'

export type TableInputs = {
    columns: Columns[];
    items: Items[];
    actions?: Actions[];
} 