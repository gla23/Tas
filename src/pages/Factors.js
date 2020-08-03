import React from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import MemoriseTab from "../components/MemoriseTab";
import TasSlider from "../widgets/TasSlider";
import { primeFactors } from "../data/primeFactors";

const initialRange = [1, 40];
const max = 100;
const Factors = (props) => {
	const [range, setRange] = useLocalStorage("factors", initialRange);
	const factors = primeFactors(max);
	function* questionsGeneratorFunction() {
		yield* factors.slice(2).map((factors, index) => ({
			clue: index + 2,
			answer: factors.join(" "),
			uninvertible: factors.length === 1,
		}));
	}

	return (
		<>
			<MemoriseTab
				questions={questionsGeneratorFunction}
				modes={["random", "next"]}
				caseSensitive={false}
				questionOptions={{
					randomStart: range[0] - 2,
					randomEnd: range[1] - 1,
					consecutive: 1,
				}}
				navigation={(mode) =>
					mode === "random" && (
						<>
							<h5>Range of n</h5>
							<TasSlider
								value={range}
								max={100}
								onChange={(value) => setRange(value)}
								markSelected
							/>
						</>
					)
				}
			/>
		</>
	);
};

export default Factors;