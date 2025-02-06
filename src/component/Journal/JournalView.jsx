import React, { useState, useEffect } from "react";
import axios from "../../axios/axios"; // Adjust the import path
import styles from "./journalView.module.css";

function JournalView() {
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [journals, setJournals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchJournals = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You must be logged in to view journals.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/dailyJournal");
        setJournals(response.data);
      } catch (error) {
        console.error(error);
        alert("Failed to fetch journals.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJournals(); // Fetch initially

    // Auto-fetch every 5 seconds
    const interval = setInterval(fetchJournals, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    const date = new Date(`1970-01-01T${timeString}Z`);
    const options = { hour: "2-digit", minute: "2-digit" };
    return date.toLocaleTimeString([], options);
  };

  const truncateText = (html, maxLength) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";
    return plainText.length > maxLength
      ? `${plainText.slice(0, 700)}...`
      : plainText;
  };

  const handleJournalClick = (journal) => {
    setSelectedJournal(journal);
  };

  const handleBackClick = () => {
    setSelectedJournal(null);
  };

  return (
    <>
      <div className={styles.journal}>
        <div className={styles.journal_header}>
          {!selectedJournal ? (
            <div className={styles.journal_title}>Journals</div>
          ) : (
            <>
              <h3 className={styles.selectedTitle}>
                {formatDate(selectedJournal.entry_date)} -{" "}
                {formatTime(selectedJournal.entry_time)}
              </h3>
              <button className={styles.back_button} onClick={handleBackClick}>
                <span className={styles.backText}>Back</span>
              </button>
            </>
          )}
        </div>
        <hr />

        <div className={styles.journal_content}>
          {selectedJournal ? (
            <div className={styles.journal_details}>
              <h3>{selectedJournal.title}</h3>
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedJournal.description,
                }}
              ></div>
            </div>
          ) : (
            <div className={styles.journal_list}>
              {isLoading ? (
                <p>Loading journals...</p>
              ) : (
                journals.map((journal, index) => (
                  <div
                    key={journal.id || `journal-${index}`}
                    className={styles.journal_preview}
                    onClick={() => handleJournalClick(journal)}
                  >
                    <h3>
                      {formatDate(journal.entry_date)} -{" "}
                      {formatTime(journal.entry_time)}
                    </h3>
                    <h5>{journal.title}</h5>
                    <p>{truncateText(journal.description, 150)}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default JournalView;
