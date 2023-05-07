import { GlobalStateContext } from "../../context/GlobalStateContext";
import { useContext, useState } from "react";
import { Tooltip } from "../../components";
import { TextArea } from "../flow/nodes/fields";
import { useQuery } from "@tanstack/react-query";

export interface ChatProps {
    className?: string;
}

export const Chat = ({ className = "" }: ChatProps) => {
    const globalServices = useContext(GlobalStateContext);

    const handleSubmitMessage = () => {

    }

    const [currentInput, setCurrentInput] = useState<string>(`parse the on-chain request event logs and the CBOR payload inside it. 
        
    Then make a POST request to my external adapter, sending the decoded user ID in the request body. 
    
    The response will be in the format { data: { result: 1234 }} where 1234 is an example of the user's score.
    
    Parse and encode the user's score and submit it back on-chain.`)

    return (
        <>
            <div className="flex items-center justify-start gap-2 mb-4">
                <h4 className="uppercase text-sm font-bold tracking-wider text-gray-400">Linkit AI</h4>
                <Tooltip className="text-sm text-gray-300">
                    <p>Let our AI assistant help you out</p>
                </Tooltip>
            </div>
            <div>
                <p>Generate me a job spec that will:</p>
                <TextArea
                    textAreaClassName="w-80 h-96"
                    placeholder={`e.g. parse the on-chain request event logs and the CBOR payload inside it. 
        
        Then make a POST request to my external adapter, sending the decoded user ID in the request body. 
        
        The response will be in the format { data: { result: 1234 }} where 1234 is an example of the user's score.
        
        Parse and encode the user's score and submit it back on-chain.`}
                    value={currentInput}
                    onChange={(newValue) => setCurrentInput(newValue)} />
            </div>
            <button className="btn btn-outline" onClick={handleSubmitMessage}>Submit</button>
        </>
    );
};
