import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Chip } from "./chip";

export function MultiSelect({
    id,
    name,
    options,
    onChange,
    value,
    disabled,
    placeholder,
    invalid,
    onBlur,
}: {
    id: string;
    name: string;
    options: Array<{
        id: string;
        name: string;
    }>;
    invalid?: boolean;
    onBlur?: React.FocusEventHandler<HTMLButtonElement>;
    onChange?: (value: string[]) => void;
    value?: string[];
    disabled?: boolean;
    placeholder?: string;
}) {
    const [selectedList, setSelectedList] = useState<string[]>(value || []);
    const [selectValue, setSelectValue] = useState<string>("");

    useEffect(() => {
        if (onChange) {
            onChange(selectedList);
        }
    }, [onChange, selectedList]);

    const addToSelected = (id: string) => {
        if (disabled) return;
        if (!selectedList.includes(id)) {
            setSelectedList([...selectedList, id]);
        }
        setSelectValue("");
    };

    const removeFromSelected = (id: string) => {
        if (disabled) return;
        const newList = selectedList.filter((sid) => sid !== id);
        setSelectedList(newList);
    };

    return (
        <div className="space-y-2">
            <Select
                name={name}
                disabled={disabled}
                data-invalid={invalid}
                onValueChange={addToSelected}
                value={selectValue}>
                <SelectTrigger id={id} aria-invalid={invalid} onBlur={onBlur} className="w-full">
                    <SelectValue
                        placeholder={options.length === selectedList.length ? "No more options available" : placeholder}
                    />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem
                                key={option.id}
                                value={option.id.toString()}
                                disabled={selectedList.includes(option.id)}>
                                <Chip className="mr-2">{option.name}</Chip>
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <div className="space-y-2 space-x-2" role="list">
                {selectedList.map((id) => {
                    const option = options.find((opt) => opt.id === id);
                    if (!option) return null;
                    return (
                        <Chip closeable disabled={disabled} key={id} onClose={() => removeFromSelected(id)}>
                            {option.name}
                        </Chip>
                    );
                })}
            </div>
        </div>
    );
}
