import spacy
import scispacy
from scispacy.linking import EntityLinker
 
nlp = spacy.load("en_core_sci_md")
nlp.add_pipe("scispacy_linker", config={"resolve_abbreviations": True, "linker_name": "umls"})
def extract_tagged_entities(text):
    doc = nlp(text)
    results = []
    for ent in doc.ents:
        for umls_ent in ent._.kb_ents[:1]:  # Top UMLS match
            concept = nlp.get_pipe("scispacy_linker").kb.cui_to_entity[umls_ent[0]]
            results.append({
                "text": ent.text,
                "umls_cui": umls_ent[0],
                "semantic_type": concept.types[0]  # Example: ['T184']
            })
    return results

print(extract_tagged_entities('he patient has shortness of breath and chest pain.'))