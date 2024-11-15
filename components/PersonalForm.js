const InputForm = ({ formData, setFormData, setExpandedView }) => {

    const formatMoney = (value) => {
        // If empty input, return 0
        if (!value) return 0.00;
        
        // Handle decimal point at the end
        if (value.endsWith('.')) {
            const num = parseFloat(value + '00');
            return isNaN(num) ? 0.00 : num;
        }
        
        // Regular case
        const num = parseFloat(value.replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0.00 : parseFloat(num.toFixed(2));
    };

    const handleMoneyChange = (e) => {
        const formatted = formatMoney(e.target.value);
        setFormData(prev => ({ ...prev, amount: formatted }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div>

            <h4>{"PERSONAL DETAILS"}</h4>

            <div>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter name"
                />
            </div>

            <div className="doublegapver" />

            <div>
                <label htmlFor="amount">Amount:</label>
                <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleMoneyChange}
                    placeholder="$0.00"
                />
            </div>

            <div className="doublegapver" />

            <div>
                <label htmlFor="description">Description:</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                    rows={4}
                />
            </div>

            <div className="doublegapver" />

            <button
                onClick={() => setExpandedView('PAYMENT')}
            >
                {"CONTINUE TO PAYMENT"}
            </button>

        </div>
    );
};

export default InputForm;