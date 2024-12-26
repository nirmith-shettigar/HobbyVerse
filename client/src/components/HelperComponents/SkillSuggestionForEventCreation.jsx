import { useState, useEffect } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { useAuth } from "@/context/AuthContext";

const SkillSuggest = ({ onSkillSelect, isMultiple }) => {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const { backendUrl } = useAuth();

  const fetchSkills = async (query) => {
    try {
      const response = await axios.get(`${backendUrl}/api/skills?query=${query}`);
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  const debouncedFetchSkills = debounce(fetchSkills, 300);

  useEffect(() => {
    return () => {
      debouncedFetchSkills.cancel();
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (value.length > 0) {
      debouncedFetchSkills(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    let updatedSkills;
    if (isMultiple) {
      if (!selectedSkills.includes(suggestion.name)) {
        updatedSkills = [...selectedSkills, suggestion.name];
        setSelectedSkills(updatedSkills);
      }
    } else {
      updatedSkills = [suggestion.name];
      setSelectedSkills(updatedSkills);
    }
    onSkillSelect(updatedSkills); // Notify parent

    setInput("");
    setSuggestions([]);
  };

  const handleSkillRemove = (skill) => {
    const updatedSkills = selectedSkills.filter((s) => s !== skill);
    setSelectedSkills(updatedSkills);
    onSkillSelect(updatedSkills); // Notify parent
  };

  return (
    <div className="w-full mt-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSkills.map((skill, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm cursor-pointer"
            onClick={() => handleSkillRemove(skill)}
          >
            {skill} &times;
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          placeholder="Type to search skills..."
          value={input}
          onChange={handleInputChange}
        />
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded shadow-md mt-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SkillSuggest;

